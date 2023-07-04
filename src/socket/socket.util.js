import CommentModel from "../model/commentModel.js";
export const SeverSeverCommentInfo = async (
  io,
  CommentId,
  roomid,
  idAccount
) => {
  try {
    const commentInfo = await CommentModel.findOne(CommentId).populate({
      path: "author",
      select: "avatar fullname status",
    });

    io.to(roomid).emit("server-chat", {
      action: {
        kind: "",
        userId: "",
      },
      author: commentInfo.author,
      comment: commentInfo.comment,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      file: [],
      idAccount,
      idPerson: idAccount,
      isSee: false,
      isUser: false,
      type: commentInfo.type,
      typechat: "group",
      _id: commentInfo._id,
    });
  } catch (error) {
    console.log(error);
  }
};
