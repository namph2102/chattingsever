import RoomModel from "../model/RoomModel.js";
import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";

import CommentController from "./CommentController.js";
import InfomationController from "./InfomationController.js";

class RoomController {
  async getInfoRoom(req, res) {
    try {
      const { accountid, personid, roomid } = req.body.data;

      if (!roomid) {
        roomid = await RoomController.CreateRoom(accountid, personid);
      }

      const listChatting =
        (await CommentModel.find({ room: roomid }).populate({
          path: "author",
          select: "avatar fullname status",
        })) || [];
      return res.status(200).json({
        listChatting,
        message: "Lấy thành công mã phòng",
        status: 200,
      });
    } catch (err) {
      console.log(err.message);
    }
  }
  async CreateRoom(accountid, personid) {
    try {
      const room = await RoomModel.create({
        listUser: [accountid, personid],
        type: "friend",
        role: accountid,
      });
      // addroom vào cho user;
      await UserModel.findByIdAndUpdate(accountid, {
        $push: { rooms: room._id },
      });
      await UserModel.findByIdAndUpdate(personid, {
        $push: { rooms: room._id },
      });
      return room._id.toString();
    } catch (error) {
      console.log(error);
    }
  }

  // chat in group
  async createGroupRoom(idUserCreate, name) {
    try {
      const infoRoom = await RoomModel.create({
        name,
        role: idUserCreate,
        type: "group",
      });
      await this.handleAddUserInRoom(infoRoom._id.toString(), idUserCreate);
      await InfomationController.createInfoUser(
        idUserCreate,
        idUserCreate,
        3,
        true,
        "Bạn đã tạo phòng chat " + name
      );
      // ******************

      return infoRoom._id.toString();
    } catch (error) {
      console.log(error);
      return null;
    }
  }
  async handleAddUserInRoom(idRoom, idUser) {
    try {
      const checkRoomExtended = await RoomModel.findById(idRoom);
      if (checkRoomExtended) {
        const checkRoomInUser = await UserModel.findById(idUser).select(
          "rooms fullname"
        );
        const listRooms = checkRoomInUser?.rooms || [];

        if (!listRooms.includes(idRoom)) {
          await UserModel.findByIdAndUpdate(idUser, {
            $push: { rooms: idRoom },
          });
          await RoomModel.findByIdAndUpdate(idRoom, {
            $push: { listUser: idUser },
          });

          return await InfomationController.createInfoUser(
            checkRoomExtended.role.toString(),
            idUser,
            4,
            true
          );
          return;
        }
      }
      throw new Error("Lỗi thêm room và user rồi!");
    } catch (error) {
      console.log(error);
    }
  }
  async UpdateRoomSettings(req, res) {
    try {
      const { url, path, name, des, room, idSend } = req.body.data;
      if (!room) throw new Error("Thiếu dữ liệu");
      let resultRoom;
      if (url && path) {
        if (des) {
          resultRoom = await RoomModel.findByIdAndUpdate(room, {
            avatar: { path, url },
            des,
            name,
          });
        } else {
          resultRoom = await RoomModel.findByIdAndUpdate(room, {
            avatar: { path, url },
            name,
          });
        }
        await Promise.all([
          CommentController.createComment(
            room,
            "đã cập nhập ảnh đại diện",
            idSend,
            "info"
          ),
          CommentController.createComment(
            room,
            `đã thay đổi tên nhóm thành ${name}`,
            idSend,
            "info"
          ),
        ]);
      } else {
        if (des) {
          resultRoom = await RoomModel.findByIdAndUpdate(room, {
            des,
            name,
          });
        } else {
          resultRoom = await RoomModel.findByIdAndUpdate(room, {
            name,
          });
        }

        await CommentController.createComment(
          room,
          `đã thay đổi tên nhóm thành ${name}`,
          idSend,
          "info"
        );
      }

      await InfomationController.createInfoUser(
        idSend,
        idSend,
        6,
        true,
        ` đã cập nhập nhóm ${name}`
      );

      res
        .status(200)
        .json({ message: " Cập nhập thành công", statusCode: 200, resultRoom });
    } catch (error) {
      console.log(error);
      res.status(404).json({ statusCode: 404, message: error.message });
    }
  }
}
export default new RoomController();
