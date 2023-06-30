import CommentModel from "../model/commentModel.js";
class CommentController {
  async createComment(room, comment, author, type, isSee = true) {
    try {
      await CommentModel.create({ room, comment, author, type, isSee });
    } catch (err) {
      console.log(err);
    }
  }
}

export default new CommentController();
