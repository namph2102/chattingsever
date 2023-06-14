class CommentController {
  async create(req, res) {
    console.log(req.body);
    const { comment, type, author, isSee, room } = req.body.data;
  }
}
