import pkg from "mongoose";
const { Schema, model, models } = pkg;
const CateSchema = new Schema(
  {
    slug: { type: String, require: true, lowercase: true },
    cate: { type: String, require: true, lowercase: true },
    author: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    des: { type: String, default: "" },
    image: { type: String, default: "" },
    pathImage: { type: String, default: "" },
  },
  { timestamps: true }
);
const CateModel = models.Cate || model("Cate", CateSchema);
export default CateModel;
