import CommentController from "../controller/CommentController.js";
import { SeverSeverCommentInfo } from "./socket.util.js";
import InfomationController from "../controller/InfomationController.js";
class UserCall {
  constructor(socket, io) {
    this.hanldeCreateRoomCall(socket, io);
    this.handleRoomCallPeerJS(socket, io);
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
  async handleRoomCallPeerJS(socket, io) {
    socket.on(
      "user-join-room-call",
      async ({ idPeerJs, idAccount, roomId, personid, fullname, avatar }) => {
        try {
          const commentData = await CommentController.createComment(
            roomId,
            idPeerJs,
            idAccount,
            "peerjs",
            true
          );
          await SeverSeverCommentInfo(
            io,
            commentData._id,
            roomId,
            idAccount,
            "friend"
          );
          await InfomationController.createInfoUser(
            idAccount,
            personid,
            7,
            false,
            idPeerJs
          );

          socket.broadcast.to(personid).emit(`sever-send-open-status-call`, {
            idPeerJs,
            idAccount,
            roomId,
            personid,
            fullname,
            avatar,
          });
        } catch (err) {
          console.log(err);
        }
      }
    );
    socket.on("user-leave-room-call-now", ({ idAccount, idPerson }) => {
      socket.emit("server-send-leave-room-call");
      io.to(idPerson).emit("server-send-leave-room-call");
    });
  }
}
export default UserCall;
