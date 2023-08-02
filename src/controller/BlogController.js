import blogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
import UserModel from "../model/userModel.js";
import InfoModel from "../model/InfoModel.js";
import * as cheerio from "cheerio";
import axios from "axios";
export async function GetAccount(userId) {
  if (!userId) throw new Error("Thiếu dữ liệu ");
  const account = await UserModel.findById(userId).select("permission");
  if (!account) throw new Error("tài khoản khồng tại");
  return account;
}
function isImageLink(url) {
  const pattern = /\.(jpeg|jpg|png|svg)$/i;
  return pattern.test(url);
}
class BlogController {
  async getTopBlog(req, res) {
    try {
      const limit = req.body?.data || 100;
      const listBlog =
        (await blogModel
          .find({ status: true })
          .sort({ view: -1 })
          .limit(limit)
          .populate({ path: "author", select: "fullname avatar" })
          .populate({ path: "category", select: "cate slug" })
          .select(
            "author category createdAt updatedAt title slug des pathImage status view image keywords"
          )) || [];
      res.status(200).json(listBlog);
    } catch {
      res.stauts.json([]);
    }
  }
  async getAllblogStatusTrue(req, res) {
    try {
      const listBlog =
        (await blogModel
          .find({ status: true })
          .sort({ view: -1 })
          .populate({ path: "author", select: "fullname avatar" })
          .populate({ path: "category", select: "cate slug" })
          .select(
            "author category createdAt updatedAt title slug des pathImage status view image keywords"
          )) || [];
      res.status(200).json(listBlog);
    } catch (err) {
      res.status(404).json({ message: "Error" });
    }
  }

  async allblogDashboard(req, res) {
    try {
      const {
        limit = 10,
        skip = 0,
        userId = "",
        authorID = "",
      } = req.body.data;

      const account = await GetAccount(userId);
      const isBoss = account.permission == "zecky";
      let SubFind = {};
      if (authorID == "true") {
        SubFind = { status: true };
      } else if (authorID == "false") {
        SubFind = { status: false };
      } else if (!authorID) {
        if (!isBoss) {
          SubFind = { author: account._id };
        }
      } else if (isBoss && authorID) {
        SubFind = { author: authorID };
      } else {
        SubFind = { author: account._id };
      }

      const total = await blogModel.find(SubFind).count();

      const [{ totalView = 0 }] = await blogModel.aggregate([
        {
          $group: {
            _id: null,
            totalView: { $sum: "$view" },
          },
        },
      ]);

      const listBlog = await blogModel
        .find(SubFind)
        .populate({ path: "author", select: "fullname avatar" })
        .populate({ path: "category", select: "cate slug" })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      res.status(200).json({ listBlog, total, totalView });
    } catch (err) {
      console.log(err.message);
      res.status(200).json({ listBlog: [], total: 0, totalView: 0 });
    }
  }
  async getBlog(req, res) {
    try {
      const { slug } = req.body;
      {
        if (!slug) throw new Error("Slug không tồn tại");
      }
      const blog = await blogModel
        .findOneAndUpdate({ slug }, { $inc: { view: 1 } })
        .populate({ path: "author", select: "fullname" })
        .populate({ path: "category", select: "cate slug" });
      if (!blog) throw new Error("cant not get blog");

      const listBlogRandom = await blogModel.aggregate([
        {
          $match: {
            status: true,
            category: blog.category._id,
            slug: { $nin: [slug] },
          },
        },
        { $sample: { size: 6 } },
      ]);

      const listCate = (await CateModel.find()) || [];
      res.status(200).json({ data: blog, listBlogRandom, listCate });
    } catch (err) {
      res.status(200).json({ data: "", listBlogRandom: [] });
    }
  }
  async CreateBlog(req, res) {
    try {
      const data = await req.body.data;
      const checkExtends = await blogModel.findOne({
        slug: data.slug,
      });
      if (checkExtends) {
        return res.status(200).json({
          statusCode: 200,
          message: "Bài viết đã tồn tại rồi",
        });
      }

      const newBlog = await blogModel.create(data);
      await InfoModel.create({
        userSend: data.author,
        userAccept: data.author,
        type: 8,
        status: data.status,
        message: `Bạn đã tạo bài viết "${data.title}" thành công`,
      });
      return res.status(201).json({
        statusCode: 201,
        message: "Thêm thành công bài viết",
        newBlog: newBlog,
      });
    } catch (err) {
      return res.status(200).json({ statusCode: 200, message: err.message });
    }
  }
  async BlogEdit(req, res) {
    try {
      const { data, idBlog } = req.body.data;
      console.log(data);
      await blogModel.findByIdAndUpdate(idBlog, data);

      res.status(200).json("Chỉnh sửa thành công");
    } catch (err) {
      console.log(err);
      res.status(200).json("Chỉnh sửa thất bại");
    }
  }
  async handleDelete(req, res) {
    try {
      const blogid = req.params.blogid;
      if (!blogid) {
        throw new Error("Xóa không thành công");
      }
      await blogModel.findByIdAndDelete(blogid);
      res.status(200).json("Xóa thành công");
    } catch (err) {
      res.status(200).json(err.message);
    }
  }
  async handleSearchDashboard(req, res) {
    try {
      const { search, userId } = req.body.data;
      const account = await GetAccount(userId);
      const isBoss = account.permission == "zecky";
      const SubFind = isBoss ? {} : { author: account._id };

      const listBlogs = await blogModel
        .find({ $text: { $search: search }, ...SubFind })
        .populate({ path: "author", select: "fullname avatar" })
        .populate({ path: "category", select: "cate slug" });
      res.status(200).json(listBlogs);
    } catch (err) {
      res.status(200).json([]);
    }
  }
  async handleSearchPage(req, res) {
    try {
      const search = req.body.data;

      const listBlogs = await blogModel
        .find({ $text: { $search: search }, status: true })
        .populate({ path: "author", select: "fullname avatar" })
        .populate({ path: "category", select: "cate slug" });
      res.status(200).json(listBlogs);
    } catch (err) {
      res.status(200).json([]);
    }
  }
  async CrawLinkBlog(req, res) {
    try {
      const link = req.body.data;
      const result = await axios.get(link, {
        crossdomain: true,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "*",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Headers": "*",
        },
      });
      const html = await result.data;

      const $ = cheerio.load(html);
      const title =
        $("title").text().replace(/\s{2}/g, " ")?.trim() ||
        $("h1").text().replace(/\s{2}/g, " ")?.trim() ||
        $("h2").text().replace(/\s{2}/g, " ")?.trim();
      const image = $('meta[property="og:image"]').attr("content");
      const des = $('meta[name="description"]').attr("content");
      let keywords = $("meta[keywords]").attr("content");
      if (!keywords && title.includes(" ")) {
        keywords = title.split(" ").join(",");
      }
      const listImageCover = [];
      $("img[src]").each((i, img) => {
        const src = $(img).attr("src");

        if (src) {
          listImageCover.push(src);
        }
      });

      const paragraphs = [];
      $("p").each((index, element) => {
        const paragraphText = $(element).text()?.trim().replace(/\s{2}/, " ");
        const regex = /((http|https):\/\/[^\s]+)/g;
        const links = paragraphText.match(regex);
        if (links && links[0]) {
          links.forEach((link) => {
            if (isImageLink(link)) {
              paragraphs.push(`linkimage${link}linkimage`);
            } else
              paragraphs.push(
                `<a href="${link}" target="_blank" rel="noopener noreferrer">${link}</a>`
              );
          });
        }
        paragraphText && paragraphs.push(`<p >${paragraphText}</p><br/>`);
      });

      return res.status(201).json({
        title,
        image,
        des,
        keywords,
        source: link,
        content: paragraphs.join("").replace(/\s{2}/g, " "),
        listImageCover: Array.from(new Set(listImageCover)),
      });
    } catch (err) {
      res.status(404).json(err.message);
    }
  }
}
export default new BlogController();
