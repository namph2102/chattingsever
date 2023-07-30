import BlogModel from "../model/blogModel.js";
import CateModel from "../model/CateModel.js";
import InfoModel from "../model/InfoModel.js";
import CommetModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import RoomModel from "../model/RoomModel.js";
import { GetAccount } from "./BlogController.js";
import GoogleDrive from "../servies/googledrive/upload.js";
import EncodeHandle from "../auth/token.js";

const createInfomation = async (from, to, message, status = true, type = 8) => {
  return await InfoModel.create({
    userSend: from,
    userAccept: to,
    type,
    status: status,
    message,
  });
};
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
      type: { $gt: 7 },
      userSend: idAccount,
    }).count();
    const listNotice = await InfoModel.find({
      type: { $gt: 7 },
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

    if (!info || !idAccount) {
      throw new Error("Thiếu dữ liệu");
    }
    if (info.password) {
      info.password = await EncodeHandle.generatePassword(info.password);
    }

    const account = await UserModel.findByIdAndUpdate(idAccount, info);
    await createInfomation(
      idZeckyAdmin,
      idZeckyAdmin,
      `Bạn đã thay đổi thông tin  tài khoản  ${account.username} thành công`
    );
    if (!account) {
      throw new Error("thay đổi  tải khoản thất bại");
    }

    res.status(200).json(info);
  }
  async deleteAccount(req, res) {
    const idAccount = req.params.idAccount;

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

    await Promise.all([
      async1,
      async2,
      async3,
      async4,
      async5,
      async6,
      async7,
      async8,
      createInfomation(
        idZeckyAdmin,
        idZeckyAdmin,
        `Bạn đã xóa tài khoản ${account.fullname} thành công `
      ),
    ]);

    return res.status(202).json(`Xóa thành công ${account.fullname}`);
  }
  async listcommentDocument(req, res) {
    const idAccount = await req.body.data;
    const listcommentfile =
      (await CommetModel.find({
        author: idAccount,
        type: { $in: ["image", "document"] },
      })) || [];

    res.status(200).json(listcommentfile);
  }
  async getAllListFileGoogleDrive(req, res) {
    const listFile = await GoogleDrive.getAllist();
    return res.status(200).json(listFile);
  }
  async deleteOneDocument(req, res) {
    const { idComment, path, fileName } = await req.body.data;
    const comment = await CommetModel.findByIdAndUpdate(idComment, {
      $pull: { file: { path: path } },
    });
    if (comment) {
      if (comment?.file?.length == 1) {
        await CommetModel.findByIdAndUpdate(idComment, {
          comment: "Quản trị viên đã xóa bình luận này!",
          type: "text",
        });
      }
      const async1 = GoogleDrive.deletefile(path);
      const async2 = createInfomation(
        idZeckyAdmin,
        comment.author,
        `đã xóa tài liệu ${fileName}`,
        true,
        6
      );
      await Promise.all([async1, async2]);
    }
    res.status(201).json("Xóa thành công 1 tài liệu");
  }
  async deleteDocumentComment(req, res) {
    const idComment = await req.params.idComment;
    const comment = await CommetModel.findByIdAndDelete(idComment);
    if (comment?.file) {
      createInfomation(
        idZeckyAdmin,
        idZeckyAdmin,
        `Bạn đã xóa nội dung bình luận ${comment.message}`,
        true,
        8
      );
      comment.file.forEach(async (item) => {
        item.path && (await GoogleDrive.deletefile(item.path));
      });
    }
    res.status(202).json("Xóa thành công");
  }
  async deleteNotice(req, res) {
    const idUser = req.params.idUser;
    const result = await InfoModel.deleteMany({
      $or: [{ userSend: idUser }, { userAccept: idUser }],
    });
    if (result) {
      await createInfomation(
        idZeckyAdmin,
        idUser,
        `đã xóa toàn bộ thông báo của bạn`,
        true,
        6
      );
    }
    res.status(200).json("Xóa tất cà thông báo thành công");
  }
  async deleteAllNotice(req, res) {
    await InfoModel.deleteMany({});
    res.status(200).json("Xóa tất cà thông báo thành công");
  }
  async getListComments(req, res) {
    const { author, limit, skip } = await req.body.data;
    const totalComment = await CommetModel.find({ author: author }).count();
    const listComments = await CommetModel.find({ author: author })
      .limit(limit)
      .skip(skip)
      .sort({
        createdAt: 1,
      });
    res.status(200).json({ listComments, totalComment });
  }
  async deletecomment(req, res) {
    const idComment = await req.params.idComment;
    const result = await CommetModel.findByIdAndUpdate(idComment, {
      type: "text",
      comment:
        '<span class="text-sm  italic text-red-400">Quản trị viên đã xóa nội dung này rồi</span>',
    });
    if (result?.file && result?.file?.length > 0) {
      result.file.forEach(async (file) => {
        file.path && (await GoogleDrive.deletefile(file.path));
      });
    }
    if (result) {
      res.status(200).json("Xóa thành công nội dung bình luận");
    } else {
      res.status(200).json("Không tồn tại bình luận này");
    }
  }
}
export default new DashBoardController();
