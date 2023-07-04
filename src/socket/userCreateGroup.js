import RoomController from "../controller/RoomController.js";
import InfoModel from "../model/InfoModel.js";
import InfomationController from "../controller/InfomationController.js";
import UserModel from "../model/userModel.js";
import RoomModel from "../model/RoomModel.js";
import CommentModel from "../model/commentModel.js";
import CommentController from "../controller/CommentController.js";
import { SeverSeverCommentInfo } from "./socket.util.js";
class userCreateGroupChat {
  constructor(socket, io) {
    socket.on("join-in-group-all", (idroom) => {
      // cho các room của group lắng nghe sự kiện khi thay đổi
      socket.join(`room-change-${idroom}`);
    });
    this.handleInviteGround(socket, io);
    this.handleChangeSettingGroup(socket, io);
    this.handleUserLeaverRoom(socket, io);
  }
  async handleInviteGround(socket, io) {
    try {
      // event mời tham gia room
      socket.on(
        "user-create-group",
        async ({
          nameRoom = "",
          listIdInvited = [],
          fullname = "",
          userSendID,
        }) => {
          if (nameRoom && userSendID) {
            // tạo room
            const idRoom = await RoomController.createGroupRoom(
              userSendID,
              nameRoom
            );
            await CommentModel.create({
              room: idRoom,
              comment: " đã tham gia phòng",
              author: userSendID,
              type: "info",
              isSee: true,
            });
            socket.emit(
              "server-send-message-myself",
              "Bạn đã tạo thành công kênh chat " + nameRoom
            );
            if (idRoom) {
              // gửi room về cho user
              listIdInvited.forEach(async (idUser) => {
                await InfomationController.createInfoUser(
                  userSendID,
                  idUser,
                  4,
                  false,
                  idRoom
                ).then((id) => {
                  socket.broadcast.emit(`invite-to-join-room-${idUser}`, {
                    fullname,
                    nameRoom,
                    idNotice: id,
                    idRoom,
                  });
                });
              });
            }
          }
        }
      );
      socket.on(
        "user-accpet-join-group",
        async ({ idNotice, idRoom, status, userSendID }) => {
          try {
            await InfoModel.findByIdAndUpdate(idNotice, { status, type: 5 });

            if (status && userSendID) {
              CommentModel.create({
                room: idRoom,
                comment: " đã tham gia phòng",
                author: userSendID,
                type: "info",
                isSee: true,
              }).then((resultComment) => {
                SeverSeverCommentInfo(
                  io,
                  resultComment._id,
                  idRoom,
                  userSendID
                );
              });

              await RoomController.handleAddUserInRoom(idRoom, userSendID).then(
                (result) => {
                  socket.broadcast
                    .to(`room-change-${idRoom}`)
                    .emit("sever-send-update-when-user-joined");

                  socket.emit(
                    "server-send-message-myself",
                    "Bạn đã tham gia kênh chat "
                  );
                }
              );
            }
          } catch (err) {
            console.log(err);
          }
        }
      );
      // gửi lời mời tham gia rooms;

      socket.on(
        "invite-to-join-group",
        async ({ idRoom, userSendID, listIdInvited, fullname, nameRoom }) => {
          try {
            if (idRoom) {
              // gửi room về cho user
              listIdInvited.forEach(async (idUser) => {
                await InfomationController.createInfoUser(
                  userSendID,
                  idUser,
                  4,
                  false,
                  idRoom
                ).then((id) => {
                  socket.broadcast.emit(`invite-to-join-room-${idUser}`, {
                    fullname,
                    nameRoom,
                    idNotice: id,
                    idRoom,
                  });
                });
              });
            }
          } catch (err) {
            console.log(err);
          }
        }
      );
    } catch (error) {
      console.log(error);
    }
  }
  async handleChangeSettingGroup(socket, io) {
    try {
      socket.on("loading-room-setting", ({ idRoom, fullname, url }) => {
        io.to(`room-change-${idRoom}`).emit(
          "sever-send-update-when-user-joined",
          {
            fullname,
            url,
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }
  async handleUserLeaverRoom(socket, io) {
    try {
      socket.on(
        "user-leave-in-group",
        async ({ roomid, idAccount, message }) => {
          if (roomid && idAccount) {
            const roomInfo = await RoomModel.findById(roomid);
            if (!roomInfo) throw new Error("Không tìm thấy phòng cần?");
            const countMember = await UserModel.find({
              rooms: { $in: roomid },
            }).count();

            if (countMember <= 1) {
              await Promise.all([
                CommentModel.findByIdAndDelete(roomid),
                UserModel.findByIdAndUpdate(idAccount, {
                  $pull: { rooms: roomid },
                }),
                RoomModel.findByIdAndDelete(roomid),
                InfoModel.deleteMany({
                  message: roomid,
                  status: false,
                }),
              ]);
            } else {
              const responsive = await Promise.all([
                RoomModel.findByIdAndUpdate(roomid, {
                  $pull: { listUser: idAccount },
                }),
                UserModel.findByIdAndUpdate(idAccount, {
                  $pull: { rooms: roomid },
                }),
                InfomationController.createInfoUser(
                  idAccount,
                  idAccount,
                  6,
                  true,
                  message || " bạn đã rời khỏi phòng"
                ),
              ]);
            }
            const result = await CommentController.createComment(
              roomid,
              message || "đã rời khỏi phòng",
              idAccount,
              "info"
            );
            if (result) {
              // gửi comment có nội dung thông báo rời phòng
              await SeverSeverCommentInfo(io, result._id, roomid, idAccount);
            }
            io.to(idAccount).emit("client-chat-with-bot", roomid);
            io.to(`room-change-${roomid}`).emit(
              "sever-send-update-when-user-joined"
            );
          }
        }
      );
    } catch (error) {
      console.log(error.message);
    }
  }
}
export default userCreateGroupChat;
