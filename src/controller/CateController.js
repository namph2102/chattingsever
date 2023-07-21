import CateModel from "../model/CateModel.js";
import blogModel from "../model/blogModel.js";
class CateController {
  async createCate(req, res) {
    try {
      const newCate = req.body.data;
      const isCheck = await CateModel.findOne({ slug: newCate.slug });
      if (isCheck) {
        throw new Error(`Đã tồn tại danh mục ${newCate.cate}`);
      }
      const newCateCreate = await CateModel.create(newCate);

      res
        .status(201)
        .json({ message: "Tạo thành công danh mục mới", cate: newCateCreate });
    } catch (err) {
      res.status(200).json({ message: err.message });
    }
  }
  async getAllCate(req, res) {
    try {
      const listCate = (await CateModel.find()) || [];

      res.status(200).json({ listCate, message: "lấy thành công" });
      return;
    } catch (err) {
      res.status(200).json({ listcate: [], message: err.message });
    }
  }
  async getCateSlug(req, res) {
    try {
      const slug = req.body.data;
      const category = await CateModel.findOne({ slug: slug });
      if (!category) throw new Error("Không tồn tại danh mục này");

      const listBlogRandom = await blogModel
        .find({ category: category._id })
        .sort({ view: -1 })
        .limit(30);
      const listCate = (await CateModel.find()) || [];

      res
        .status(200)
        .json({ data: category, listBlogRandom: listBlogRandom, listCate });
    } catch (err) {
      console.log(err.message);
      res.status(200).json({ data: "", listBlogRandom: [] });
    }
  }
}
export default new CateController();
