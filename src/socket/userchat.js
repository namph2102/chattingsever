import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import InfomationController from "../controller/InfomationController.js";
import GoogleDrive from "../servies/googledrive/upload.js";
class UserChatSocket {
  constructor(socket, io) {
    this.handleCrudChat(socket, io);
  }
  handleCrudChat(socket, io) {
    socket.on(
      "client-send-chatting-change",
      ({ id, userId, type, typeChatting }) => {
        const action = { userId, kind: type };

        if (type == "delete") {
          CommentModel.findByIdAndUpdate(id, {
            action,
          }).then((result) => {
            if (typeChatting != "text") {
              if (userId == result.author) {
                CommentModel.findByIdAndUpdate(id, {
                  file: [],
                  type: "text",
                }).then((result) => {
                  if (typeChatting == "audio" || typeChatting == "document") {
                    if (result.comment) {
                      GoogleDrive.deletefile(result.comment);
                    }
                  }
                });
              }
            }

            io.in(socket.currentroom).emit(`server-send-chatting-change`, {
              action,
              idComment: id,
            });
          });
        } else if (type == "edit") {
          CommentModel.findById(id).then((result) => {
            if (result.author == userId) {
              CommentModel.findByIdAndUpdate(id, {
                comment: typeChatting,
                action,
              }).then((result) => {});
              io.in(socket.currentroom).emit(`server-send-chatting-change`, {
                action: {
                  userId,
                  kind: type,
                  newComment: typeChatting,
                },
                idComment: id,
              });
            }
          });
        } else if (type == "ghim") {
          CommentModel.findByIdAndUpdate(id, { action }).then((result) => {
            if (result.action.kind == "ghim") {
              action.kind = "";
              CommentModel.findByIdAndUpdate(id, { action: { kind: "" } }).then(
                () => {}
              );
            }
            io.in(socket.currentroom).emit(`server-send-chatting-change`, {
              action,
              idComment: id,
            });
          });
        }
      }
    );
  }
}
export default UserChatSocket;
