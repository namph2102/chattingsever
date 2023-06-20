import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import InfomationController from "../controller/InfomationController.js";
const listAccountOnline = [];
// {[iduser]:[{room1:true},{room2:false}]}
const listUserJoinRoom = [];

class handleSocketCall {
  socket;
  constructor(socket) {
    this.socket = socket;

    // chatting with tow user
    socket.on("tao-room", async (idroom) => {
      socket.currentroom = idroom;
      socket.join(idroom);

      if (socket.userid) {
        try {
          await CommentModel.updateMany(
            { room: idroom, recipient: socket.userid },
            { isSee: true }
          );
        } catch {}
        if (listUserJoinRoom[socket.userid]) {
          listUserJoinRoom[socket.userid] = {
            ...listUserJoinRoom[socket.userid],
            [idroom]: true,
          };
        } else {
          listUserJoinRoom[socket.userid] = { [idroom]: true };
        }
      }
    });
    // user leave room
    socket.on("leaver-room-chat-current", (idroom) => {
      try {
        if (idroom) {
          socket.leave(idroom);
          const roomCuurent = listUserJoinRoom[socket.userid];
          if (roomCuurent[idroom]) {
            roomCuurent[idroom] = false;
          }
        }
      } catch {}
    });

    socket.on("user-chat", async (data) => {
      if (!socket.currentroom) return;
      try {
        let isSeeUserSend = false;

        // xui xui undefile là toang
        if (listUserJoinRoom[data.idPerson]) {
          if (
            listUserJoinRoom[data.idPerson][socket.currentroom] == true ||
            listUserJoinRoom[data.idPerson][socket.currentroom] == false
          ) {
            isSeeUserSend = listUserJoinRoom[data.idPerson][socket.currentroom];
          }
        }
        const result = await CommentModel.create({
          room: socket.currentroom,
          comment: data.comment,
          author: data.author._id,
          type: data.type,
          isSee: isSeeUserSend,
          recipient: data.idPerson,
          file: data.file || {},
        });
        socket.broadcast
          .to(socket.currentroom)
          .emit("server-chat", { ...data, _id: result._id });
        socket.emit("user-chat-message", {
          ...data,
          isSee: isSeeUserSend,
          _id: result._id,
        });
      } catch {}
    });

    socket.on("disconnect", () => {
      if (socket.userid) {
        this.handleUserOffline(socket.userid);
        if (listUserJoinRoom[socket.userid]) {
          delete listUserJoinRoom[socket.userid];
        }
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
      socket.broadcast.emit(`friend-chattings-${userid}`, true);
      if (!listAccountOnline.includes(userid)) {
        listAccountOnline.push(userid);
      }
    });

    // options
    this.handleUserAddFriends(socket);
    this.handleUpdateInfomation(socket);
  }
  async handleUserOffline(id) {
    try {
      await UserModel.findByIdAndUpdate(id, { status: false });
    } catch {}
  }
  async handleUserAddFriends(socket) {
    socket.on("add-friend", (data) => {
      const { userSend, userAccept, fullname } = data;
      InfomationController.addInfomation(userSend, userAccept, 1, false).then(
        (result) => {
          socket
            .to(userAccept)
            .emit(`infomation-add-friend-${userAccept}`, fullname);
        }
      );
    });
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
