import blogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
class BlogController {
  async getAllBlog(req, res) {
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
}
export default new BlogController();
