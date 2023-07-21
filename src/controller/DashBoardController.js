import BlogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
import CommetModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import RoomModel from "../model/RoomModel.js";

class DashBoardController {
  async homepage(req, res) {
    const [listAccount = [], listBlog = [], listComment = [], listRooms = []] =
      await Promise.all([
        UserModel.aggregate([
          { $project: { password: 0, accessToken: 0, refreshToken: 0 } },
          { $sort: { follows: -1 } },
        ]),
        BlogModel.find()
          .populate({ path: "category", select: "cate slug" })
          .sort({ view: -1 })
          .select("author category title des status slug view"),
        CommetModel.find().populate({
          path: "author",
          select: "fullname avatar blocked",
        }),
        RoomModel.find({ type: "group" }),
      ]);
    res.status(200).json({ listAccount, listBlog, listComment, listRooms });
    try {
    } catch (error) {
      console.log(error.message);
    }
  }
}
export default new DashBoardController();
