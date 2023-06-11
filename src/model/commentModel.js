import { Schema, model, models } from 'mongoose';

//type comment   1: text , 2:file ,3 Link

const commentSchema = new Schema(
  {
    room: { type: Schema.Types.ObjectId, required: true, ref: 'Room' },
    comment: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    type: { type: String, default: 'text', require: true },
  },
  { timestamps: true }
);

const CommentModel = models.Comment || model('Comment', commentSchema);

export default CommentModel;
