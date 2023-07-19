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
    view: { type: Number, default: 0 },
    category: { type: Schema.Types.ObjectId, require: true, ref: "Cate" },
    pathImage: { type: String, default: "" },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      default: "649eb8529eeb9ff7df44758b",
      ref: "User",
    },
  },
  { timestamps: true }
);
const blogModel = models.Blog || model("Blog", blogMoModel);
export default blogModel;
