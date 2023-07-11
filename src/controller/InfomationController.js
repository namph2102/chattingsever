import InfoModel from "../model/InfoModel.js";
import userModel from "../model/userModel.js";
import commentModel from "../model/commentModel.js";
import RoomController from "./RoomController.js";
class InfomationController {
  async addInfomation(userSend, userAccept, type = 1, status = false) {
    if (!userSend || !userAccept) throw new Error("thiếu dữ liệu info");
    try {
      let checkedTypeOne = true;
      checkedTypeOne = await InfoModel.findOne({
        userSend,
        userAccept,
        $or: [{ type: 1 }, { type: 2 }],
      });
      if (checkedTypeOne) {
        if (checkedTypeOne.type == 1) {
          await InfoModel.findById(checkedTypeOne._id, { status: true });
        }
        if (type == 2) {
          await this.updateInfomation(checkedTypeOne._id, status, type);
          if (status) {
            await RoomController.CreateRoom(userSend, userAccept);
          }
        }
        return;
      }
      await InfoModel.create({ userSend, userAccept, type, status });
    } catch (err) {
      console.error(err.message);
    }
  }
  async updateInfomation(idInfo, status = true, type = 2) {
    try {
      const infoTowAccount = await InfoModel.findByIdAndUpdate(idInfo, {
        status,
        type,
      });
      if (status && type == 2 && infoTowAccount) {
        const { userSend, userAccept } = infoTowAccount;
        if (!userAccept || !userSend) throw new Error("Thiếu dữ liệu");
        let [listSends, listAccepcts] = await Promise.all([
          userModel.findById(userSend).select("friends"),
          userModel.findById(userAccept).select("friends"),
        ]);

        if (!listSends) {
          listSends = [];
        } else {
          listSends = listSends.friends;
        }
        if (!listAccepcts) {
          listAccepcts = [];
        } else {
          listAccepcts = listAccepcts.friends;
        }

        if (!listSends.includes(userAccept)) {
          await userModel.findByIdAndUpdate(userSend, {
            $push: { friends: userAccept, listFollows: userAccept },

            $inc: { follows: 1 },
          });
        }
        if (!listAccepcts.includes(userSend)) {
          await userModel.findByIdAndUpdate(userAccept, {
            $push: { friends: userSend, listFollows: userSend },
            $inc: { follows: 1 },
          });
        }
        console.log("upladte thành công");
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  async getInfoUser(req, res) {
    try {
      const { idUser } = req.body;
      if (!idUser) throw new Error("Thiếu dữ liệu");
      const listInfo =
        (await InfoModel.find({
          $or: [{ userSend: idUser }, { userAccept: idUser }],
        })
          .sort({ updatedAt: -1 })
          .populate({
            path: "userSend userAccept",
            select: "fullname avatar status",
          })) || [];

      return res.status(200).json({
        listInfo,
        status: 200,
        message: "oke",
      });
    } catch (err) {
      console.log(err);
      res.status(403).json({ message: err.message });
    }
  }
  async createInfoUser(
    userSend,
    userAccept,
    type,
    status = true,
    message = ""
  ) {
    try {
      if (!userSend || !userAccept || !type) throw new Error("Thiếu dữ liệu");
      const result = await InfoModel.create({
        userSend,
        userAccept,
        type,
        status,
        message,
      });

      return result._id.toString();
    } catch (err) {
      throw new Error(err.message);
    }
  }
  async getListInfomationWatingAccept(req, res) {
    try {
      const { idUser } = req.body;
      const result = await InfoModel.find({ userSend: idUser, type: 1 });

      res.status(200).json({ listInfo: result, status: 200, message: "oke" });
    } catch (err) {
      console.log(err);
    }
  }
  async getListCommentCall(req, res) {
    try {
      const { idAccount, listRoom } = req.body.data;

      if (!idAccount) throw new Error("Thiếu dữ liệu");
      const listInfoCall = await commentModel
        .find({
          type: { $in: ["peerjs", "call"] },
          room: { $in: listRoom },
        })
        .populate({
          path: "author",
          select: "avatar fullname",
        })
        .populate({ path: "room", select: "name type" })
        .select("createdAt updatedAt")
        .sort({ updatedAt: -1 })
        .limit(30);

      res.status(200).json({
        listInfoCall,
        statusCode: 200,
        message: "Lấy thành công danh sách call",
      });
    } catch (err) {
      console.log(err);
      res.status(404).json({ message: err.message });
    }
  }
}
export default new InfomationController();
