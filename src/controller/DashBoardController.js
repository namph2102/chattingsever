import BlogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
import InfoModel from "../model/InfoModel.js";
import CommetModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import RoomModel from "../model/RoomModel.js";
import { GetAccount } from "./BlogController.js";
import GoogleDrive from "../servies/googledrive/upload.js";
const idZeckyAdmin = process.env.ID_ADMIN_ZECKY || "649eb8529eeb9ff7df44758b";
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
  async getListAccountAdmin(req, res) {
    const listAccount = await UserModel.find({
      permission: { $ne: "member" },
    }).select("fullname");

    res.status(200).json({
      listAccount,
      message: "Get all acounts admin successfully",
      statusCode: 200,
    });
  }
  async getListnotice(req, res) {
    const { idAccount, limit = 10, skip = 0 } = await req.body.data;
    const totalNotice = await InfoModel.find({
      type: { $gt: 0 },
      userSend: idAccount,
    }).count();
    const listNotice = await InfoModel.find({
      type: { $gt: 0 },
      userSend: idAccount,
    })
      .sort({ createdAt: -1 })
      .populate({
        path: "userSend",
        select: "fullname avatar",
      })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      message: "Lấy thành công dnah sách thông báo",
      listNotice,
      totalNotice,
      statusCode: 200,
    });
  }
  //admin
  async getFullAccount(req, res) {
    const { limit = 7, skip = 0, search = "" } = req.body.data;

    let totalAccount = 1;
    if (search) {
      totalAccount = await UserModel.find({
        $text: { $search: search },
      }).count();
    } else {
      totalAccount = await UserModel.find().count();
    }
    const listAccount = await UserModel.aggregate([
      { $match: search ? { $text: { $search: search } } : {} },
      {
        $project: {
          password: 0,
          accessToken: 0,
          refreshToken: 0,
          friends: 0,
          listFollows: 0,
          rooms: 0,
          favorites: 0,
        },
      },

      { $sort: { createdAt: -1 } },
      { $limit: skip + limit },
      { $skip: skip },
    ]);
    res.status(200).json({ listAccount, totalAccount });
  }
  async UpdateAccount(req, res) {
    const { info, idAccount } = req.body.data;
    console.log(info);
    if (!info || !idAccount) {
      throw new Error("Thiếu dữ liệu");
    }
    const account = await UserModel.findByIdAndUpdate(idAccount, info);

    if (!account) {
      throw new Error("Update  tải khoản thất bại");
    }
    res.status(200).json(info);
  }
  async deleteAccount(req, res) {
    const idAccount = req.params.idAccount;
    console.log(idAccount);
    if (idAccount == idZeckyAdmin) {
      throw new Error("Tài khoản duy nhất nắm quyền amdin không thể xóa được");
    }
    const account = await UserModel.findById(idAccount);
    if (!account) {
      throw new Error("Tài khoản không tồn tại");
    }

    account.pathAvatar && (await GoogleDrive.deletefile(account.pathAvatar));
    account.pathBackground &&
      (await GoogleDrive.deletefile(account.pathBackground));

    const [listComment] = await Promise.all([
      CommetModel.find({ author: idAccount }),
    ]);
    if (listComment) {
      listComment.forEach(async (item) => {
        if (item.file && item.file.length > 0) {
          const [{ path }] = item.file;
          if (path) {
            try {
              await GoogleDrive.deletefile(path);
            } catch {}
          }
        }
      });
    }
    const async1 = RoomModel.updateMany({}, { $pull: { listUser: idAccount } });
    const async2 = UserModel.updateMany(
      {},
      { $pull: { friends: idAccount, favorites: idAccount } }
    );
    const async3 = CommetModel.deleteMany({ author: idAccount });
    const async4 = InfoModel.deleteMany({
      $or: [{ userSend: idAccount }, { userAccept: idAccount }],
    });
    const async5 = BlogModel.updateMany(
      { author: idAccount },
      { author: idZeckyAdmin }
    );
    const async6 = CateModel.updateMany(
      { author: idAccount },
      { author: idZeckyAdmin }
    );
    const async7 = UserModel.findByIdAndDelete(idAccount);

    const async8 = RoomModel.updateMany(
      { role: idAccount },
      { role: idZeckyAdmin, $push: { listUser: idZeckyAdmin } }
    );

    const result = await Promise.all([
      async1,
      async2,
      async3,
      async4,
      async5,
      async6,
      async7,
      async8,
    ]);
    return res.status(202).json(`Xóa thành công ${account.fullname}`);
  }
}
export default new DashBoardController();
