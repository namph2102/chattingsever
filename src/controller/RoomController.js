import RoomModel from "../model/RoomModel.js";
import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
class RoomController {
  async getInfoRoom(req, res) {
    try {
      const { accountid, personid } = req.body.data;

      let room = await RoomModel.findOne({
        listUser: { $all: [accountid, personid] },
      });
      if (!room) {
        room = await RoomModel.create({
          listUser: [accountid, personid],
        });
        // addroom vào cho user;
        UserModel.findById(accountid, { $push: { rooms: room._id } });
        UserModel.findById(personid, { $push: { rooms: room._id } });
      }
      const idRoom = room._id.toString() + "";

      const [listChatting = [], person] = await Promise.all([
        CommentModel.find({ room: idRoom }).populate({
          path: "author",
          select: "avatar fullname status",
        }),
        UserModel.findById(personid).select("status fullname updatedAt"),
      ]);

      return res.status(200).json({
        room: room,
        listChatting,
        person,
        message: "Lấy thành công mã phòng",
        status: 200,
      });
    } catch (err) {
      console.log(err.message);
    }
  }
}
export default new RoomController();
