import RoomController from "../controller/RoomController.js";
import InfoModel from "../model/InfoModel.js";
import InfomationController from "../controller/InfomationController.js";
class userCreateGroupChat {
  constructor(socket, io) {
    this.handleInviteGround(socket, io);
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
            console.log("phòng đã tạo idRoom", idRoom);
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
              await RoomController.handleAddUserInRoom(idRoom, userSendID).then(
                (result) => {
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
    } catch (error) {
      console.log(error);
    }
  }
}
export default userCreateGroupChat;
