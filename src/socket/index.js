import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import InfomationController from "../controller/InfomationController.js";
import { base64ToFile } from "../utils/index.js";

export const listAccountOnline = [];
// {[iduser]:[{room1:true},{room2:false}]}
const listUserJoinRoom = [];

class handleSocketCall {
  socket;
  constructor(socket, io) {
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
        let isSeeUserSend = data.isSee;

        // xui xui undefile là toang
        if (data.typechat == "friend" && listUserJoinRoom[data.idPerson]) {
          if (
            listUserJoinRoom[data.idPerson][socket.currentroom] == true ||
            listUserJoinRoom[data.idPerson][socket.currentroom] == false
          ) {
            isSeeUserSend = listUserJoinRoom[data.idPerson][socket.currentroom];
          }
        }
        if (data.type == "audio") {
          const idFile = await base64ToFile(data.comment);
          if (idFile) {
            data.comment = idFile;
          } else {
            data.comment = `<span class="text-red-400">Dữ liệu đang bị lỗi</span>`;
            data.type = "text";
          }
        } else if (data.type == "location") {
          //'upload location'
          try {
            const location = JSON.parse(data.comment);
            UserModel.findByIdAndUpdate(data.author._id, { location }).then(
              () => {
                console.log("upload thành công");
              }
            );
            console.log(location);
          } catch {}
        }

        const result = await CommentModel.create({
          room: socket.currentroom,
          comment: data.comment,
          author: data.author._id,
          type: data.type,
          isSee: isSeeUserSend,
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
      await UserModel.findByIdAndUpdate(userid, {
        status: true,
        timeOff: new Date().toISOString(),
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
    this.handleUserAddFriends(socket, io);
    this.handleUpdateInfomation(socket, io);
  }
  async handleUserOffline(id) {
    try {
      await UserModel.findByIdAndUpdate(id, {
        status: false,
        timeOff: new Date().toISOString(),
      });
    } catch {}
  }
  async handleUserAddFriends(socket) {
    socket.on("add-friend", (data) => {
      const { userSend, userAccept, fullname } = data;

      InfomationController.addInfomation(userSend, userAccept, 1, false).then(
        () => {
          socket
            .to(userAccept)
            .emit(`infomation-add-friend-${userAccept}`, fullname);
        }
      );
    });
  }
  async handleUpdateInfomation(socket, io) {
    socket.on("send-info-add-friend", async (data) => {
      try {
        const { idUserSend, isAccept, idUserAccept, fullnameAccept } = data;
        await InfomationController.addInfomation(
          idUserSend,
          idUserAccept,
          2,
          isAccept
        );
        io.to(idUserSend).emit("reload-show-friends-whenaccept");
        io.to(idUserAccept).emit("reload-show-friends-whenaccept");

        socket.broadcast.to(idUserSend).emit("sever-send-result-add-friend", {
          isAccept,
          fullname: fullnameAccept,
        });
      } catch (error) {
        console.log(error.message);
      }
    });
  }
  listUser = [];
}
export default handleSocketCall;
