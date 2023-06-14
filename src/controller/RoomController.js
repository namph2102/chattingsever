import RoomModel from "../model/RoomModel.js";
import CommentModel from "../model/commentModel.js";
class RoomController {
  async getInfoRoom(req, res) {
    try {
      const { accountid, personid } = req.body.data;
      let room = await RoomModel.findOne({
        listUser: { $in: [accountid, personid] },
      });
      if (!room) {
        room = await RoomModel.create({
          listUser: [accountid, personid],
        });
      }
      const idRoom = room._id.toString() + "";

      const listChatting =
        (await CommentModel.find({ room: idRoom }).populate({
          path: "author",
          select: "avatar fullname",
        })) || [];
      return res.status(200).json({
        room: room,
        listChatting,
        message: "Lấy thành công mã phòng",
        status: 200,
      });
    } catch (err) {
      console.log(err.message);
    }
  }
}
export default new RoomController();
