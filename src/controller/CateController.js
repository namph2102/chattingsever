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
      newCate.des =
        newCate.cate +
        " được cập nhật tin nóng online Việt Nam và thế giới mới nhất trong ngày";
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
        .find({ category: category._id, status: true })
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
  async getListCateAdmin(req, res) {
    const listCateCount = await blogModel.aggregate([
      {
        $group: {
          _id: "$category",
          totalCate: {
            $sum: "$qty",
          },
          count: { $sum: 1 },
        },
      },
    ]);
    const listcate = await CateModel.find({}).populate({
      path: "author",
      select: "fullname",
    });
    res.status(200).json({ listcate, listCateCount });
  }
  async updateCateAdmin(req, res) {
    const { info, idCate } = await req.body.data;
    const result = await CateModel.findByIdAndUpdate(idCate, info);
    if (result) {
      res.status(200).json("Thay đổi danh mục thành công");
      return;
    }
    res.status(200).json("Thay đổi  danh mục thất bại");
  }
  async deleteCateAdmin(req, res) {
    const idCate = req.params.idCate;
    await CateModel.findByIdAndDelete(idCate);
    res.status(200).json("Xóa danh mục thành công");
  }
}
export default new CateController();
