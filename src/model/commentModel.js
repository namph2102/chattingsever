import pkg from "mongoose";
const { Schema, model, models } = pkg;

//type comment   1: text , 2:file ,3 Link, map , video , recored

const commentSchema = new Schema(
  {
    room: { type: Schema.Types.ObjectId, required: true, ref: "Room" },
    comment: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    recipient: { type: Schema.Types.ObjectId, require: true },
    type: { type: String, default: "text", require: true },
    isSee: { type: Boolean, default: false },
    action: {
      userId: { type: String, default: "" },
      kind: { type: String, default: "" },
    },
    file: [
      { type: Object, default: { url: "", fileName: "", path: "", size: "" } },
    ],
  },
  { timestamps: true }
);

const CommentModel = models.Comment || model("Comment", commentSchema);

export default CommentModel;
