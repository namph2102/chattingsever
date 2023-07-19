import CateModel from "../model/CateModel.js";
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
}
export default new CateController();
