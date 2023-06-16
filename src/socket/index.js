import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import InfomationController from "../controller/InfomationController.js";
const listAccountOnline = [];
class handleSocketCall {
  socket;
  constructor(socket) {
    this.socket = socket;

    // chatting with tow user
    socket.on("tao-room", (idroom) => {
      socket.currentroom = idroom;
      socket.join(idroom);
    });

    socket.on("user-chat", (data) => {
      console.log(socket.currentroom);
      if (!socket.currentroom) return;
      CommentModel.create({
        room: socket.currentroom,
        comment: data.comment,
        author: data.author._id,
        isSee: data.isSee,
      });
      socket.broadcast.to(socket.currentroom).emit("server-chat", data);
    });

    socket.on("disconnect", () => {
      if (socket.userid) {
        this.handleUserOffline(socket.userid);
        socket.broadcast.emit(`friend-chattings-${socket.userid}`, false);
      }
      listAccountOnline.splice(listAccountOnline.indexOf(socket.userid), 1);
    });
    socket.on("client-acttaced-id", async (userid) => {
      socket.join(userid);
      socket.userid = userid;
      const account = await UserModel.findByIdAndUpdate(userid, {
        status: true,
      });
      socket.broadcast.emit(`friend-chattings-${userid}`, true);
      if (socket.currentroom) {
        socket.broadcast.to(socket.currentroom).emit("person-friend-online");
      }
      if (!listAccountOnline.includes(userid)) {
        listAccountOnline.push(userid);
      }
    });

    // options
    this.handleUserAddFriends(socket);
    this.handleUpdateInfomation(socket);
  }
  async handleUserOffline(id) {
    await UserModel.findByIdAndUpdate(id, { status: false });
  }
  async handleUserAddFriends(socket) {
    socket.on("add-friend", (data) => {
      const { userSend, userAccept, fullname } = data;
      InfomationController.addInfomation(userSend, userAccept, 1, false).then(
        (result) => {
          socket.to(userAccept).emit("infomation-add-friend", fullname);
        }
      );
    });
    // Gửi lời mời kết bạn type = 1;
  }
  async handleUpdateInfomation(socket) {
    socket.on("send-info-add-friend", async (data) => {
      const { idUserSend, isAccept, fullname, idInfo, fullnameAccept } = data;
      if (!isAccept) {
        await InfomationController.addInfomation(
          socket.userid,
          idUserSend,
          2,
          false
        );
      }
      await InfomationController.updateInfomation(idInfo, isAccept, 2);

      socket.broadcast.to(idUserSend).emit("sever-send-result-add-friend", {
        isAccept,
        fullname: fullnameAccept,
      });
    });
  }
  listUser = [];
}
export default handleSocketCall;
