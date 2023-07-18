import pkg from "mongoose";
const { Schema, model, models } = pkg;
const blogMoModel = new Schema(
  {
    slug: { type: String, require: true },
    title: { type: String, require: true },
    des: { type: String, require: true },
    image: { type: String, require: true },
    content: { type: String, require: true },
    status: { type: Boolean, default: false },
    author: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  },
  { timestamps: true }
);
const blogModel = models.Blog || model("Blog", blogMoModel);
export default blogModel;
