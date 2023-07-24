import BlogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
import CommetModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import RoomModel from "../model/RoomModel.js";
import { GetAccount } from "./BlogController.js";

class DashBoardController {
  async homepage(req, res) {
    try {
      const idAccount = await req.body.data;
      const account = await GetAccount(idAccount);
      const isBoss = account.permission == "zecky";
      const SubFind = isBoss ? {} : { author: account._id };
      const roomFind = isBoss ? {} : { role: account._id };
      const [
        listAccount = [],
        listAccountOnline = [],
        listBlog = [],
        totalComent = 0,
        listRooms = [],
      ] = await Promise.all([
        UserModel.aggregate([
          { $match: { permission: { $ne: "member" } } },
          { $project: { password: 0, accessToken: 0, refreshToken: 0 } },
          { $sort: { follows: -1 } },
        ]),
        UserModel.aggregate([
          { $project: { password: 0, accessToken: 0, refreshToken: 0 } },
          { $match: { status: true } },
          { $sort: { follows: -1 } },
        ]),
        BlogModel.find(SubFind)
          .populate({ path: "category", select: "cate slug" })
          .sort({ view: -1 })
          .select("author category title des status slug view")
          .limit(5),
        CommetModel.find(SubFind).count(),
        RoomModel.find({ type: "group", ...roomFind }).limit(5),
      ]);
      const [totalAccount, totalBlog, totalAccountOnline] = await Promise.all([
        UserModel.find().count(),
        BlogModel.find(SubFind).count(),
        UserModel.find({ status: true }).count(),
      ]);
      res.status(200).json({
        listAccount,
        listAccountOnline,
        listBlog,
        totalComent,
        totalAccount,
        listRooms,
        totalBlog,
        totalAccountOnline,
      });
    } catch (error) {
      console.log(error.message);
    }
  }
}
export default new DashBoardController();
