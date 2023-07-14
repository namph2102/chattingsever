import UserModel from "../model/userModel.js";
import InfomationController from "../controller/InfomationController.js";
class UserChange {
  constructor(socket, io) {
    this.handleChangeInfoProfile(socket, io);
  }
  async handleChangeInfoProfile(socket, io) {
    socket.on(
      "user-change-info-profile",
      async ({ fullname, email, phone, address, listFriend }) => {
        try {
          if (socket.userid) {
            await Promise.all([
              UserModel.findByIdAndUpdate(socket.userid, {
                fullname,
                email,
                phone,
                address,
                status: true,
              }),
              InfomationController.createInfoUser(
                socket.userid,
                socket.userid,
                6,
                true,
                " đã  thay đổi hồ sơ thành công"
              ),
            ]);

            socket.emit(
              "server-send-message-myself",
              "Bạn thay đổi hồ sơ thành công"
            );

            if (listFriend && listFriend.length > 0) {
              listFriend.map((idFriend) => {
                socket.broadcast
                  .to(idFriend)
                  .emit("friend-change-fullname-profile", {
                    id: socket.userid,
                    key: "fullname",
                    value: fullname,
                  });
              });
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    );
    socket.on(
      "user-update-avatar-profile",
      async ({ pathAvatar, avatar, listFriend }) => {
        try {
          if (socket.userid) {
            await Promise.all([
              UserModel.findByIdAndUpdate(socket.userid, {
                pathAvatar,
                avatar,
                status: true,
              }),
              InfomationController.createInfoUser(
                socket.userid,
                socket.userid,
                6,
                true,
                " đã  thay đổi hình ảnh đại diện thành công"
              ),
            ]);

            if (listFriend && listFriend.length > 0) {
              listFriend.map((idFriend) => {
                socket.broadcast
                  .to(idFriend)
                  .emit("friend-change-fullname-profile", {
                    id: socket.userid,
                    key: "avatar",
                    value: avatar,
                  });
              });
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    );
    socket.on(
      "user-update-background-profile",
      async ({ pathBackground, background }) => {
        try {
          if (socket.userid) {
            await Promise.all([
              UserModel.findByIdAndUpdate(socket.userid, {
                pathBackground,
                background,
                status: true,
              }),
              InfomationController.createInfoUser(
                socket.userid,
                socket.userid,
                6,
                true,
                " đã  thay đổi hình ảnh bìa thành công"
              ),
            ]);
          }
        } catch (error) {
          console.log(error);
        }
      }
    );
  }
}
export default UserChange;
