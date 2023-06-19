import CommentModel from "../model/commentModel.js";
import UserModel from "../model/userModel.js";
import InfomationController from "../controller/InfomationController.js";
class UserChatSocket {
  constructor(socket, io) {
    this.handleCrudChat(socket, io);
  }
  handleCrudChat(socket, io) {
    socket.on(
      "client-send-chatting-change",
      ({ id, userId, type, typeChatting }) => {
        if (type == "delete") {
          CommentModel.findByIdAndUpdate(id, {
            action: {
              userId,
              kind: type,
            },
          }).then((result) => {
            if (typeChatting == "image") {
              if (userId == result.author) {
                CommentModel.findByIdAndUpdate(id, {
                  file: [],
                  type: "text",
                }).then(() => {});
              }
            }
            const action = { userId, kind: type };

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
