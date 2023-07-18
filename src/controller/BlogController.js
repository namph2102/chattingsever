import blogMoModel from "../model/blogModel.js";
class BlogController {
  async getAllBlog(req, res) {
    try {
      const listBlog =
        (await blogMoModel
          .find({ status: true })
          .sort({ updatedAt: -1 })
          .populate({ path: "author", select: "fullname" })) || [];
      res.status(200).json(listBlog);
    } catch (err) {
      res.status(404).json({ message: "Error" });
    }
  }
  async getBlog(req, res) {
    try {
      const { slug } = req.body;
      {
        if (!slug) throw new Error("nto have slug");
      }
      const blog = await blogMoModel
        .findOne({ slug })
        .populate({ path: "author", select: "fullname" });
      if (!blog) throw new Error("cant not get blog");
      res.status(200).json(blog);
    } catch (err) {
      res.status(200).json("");
    }
  }
}
export default new BlogController();
