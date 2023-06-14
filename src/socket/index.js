import CommentModel from "../model/commentModel.js";
class handleSocketCall {
  socket;
  constructor(socket) {
    this.socket = socket;
    console.log("Có người tham gia room", socket.id);
    // chatting with tow user
    socket.on("tao-room", (idroom) => {
      socket.currentroom = idroom;
      socket.join(idroom);
    });

    socket.on("user-chat", (data) => {
      CommentModel.create({
        room: socket.currentroom,
        comment: data.comment,
        author: data.author._id,
        isSee: data.isSee,
      });
      socket.broadcast.to(socket.currentroom).emit("server-chat", data);
    });
  }
  listUser = [];
}
export default handleSocketCall;
