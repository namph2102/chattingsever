import blogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
import UserModel from "../model/userModel.js";
async function GetAccount(userId) {
  if (!userId) throw new Error("Thiếu dữ liệu ");
  const account = await UserModel.findById(userId).select("permission");
  if (!account) throw new Error("tài khoản khồng tại");
  return account;
}
class BlogController {
  async getAllblogStatusTrue(req, res) {
    try {
      const listBlog =
        (await blogModel
          .find({ status: true })
          .sort({ view: -1 })
          .populate({ path: "author", select: "fullname avatar" })
          .populate({ path: "category", select: "cate slug" })) || [];
      res.status(200).json(listBlog);
    } catch (err) {
      res.status(404).json({ message: "Error" });
    }
  }

  async allblogDashboard(req, res) {
    try {
      const { limit = 10, skip = 0, userId = "" } = req.body.data;
      const account = await GetAccount(userId);
      const isBoss = account.permission == "zecky";
      const SubFind = isBoss ? {} : { author: account._id };
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
}
export default new BlogController();
