import CommentController from "../controller/CommentController.js";
import { SeverSeverCommentInfo } from "./socket.util.js";

class UserCall {
  constructor(socket, io) {
    this.hanldeCreateRoomCall(socket, io);
  }
  async hanldeCreateRoomCall(socket, io) {
    socket.on(
      "client-create-group-room-call",
      ({ roomId, roomName, idCreated }) => {
        console.log(roomId, roomName, idCreated);
        try {
          CommentController.createComment(
            roomId,
            roomName,
            idCreated,
            "call",
            true
          ).then(async (result) => {
            await SeverSeverCommentInfo(io, result._id, roomId, idCreated);
          });
        } catch (err) {
          console.log(err);
        }
      }
    );
  }
}
export default UserCall;
