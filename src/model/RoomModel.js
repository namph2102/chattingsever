import pkg from "mongoose";
const { Schema, model, models } = pkg;
//type friend group
const roomSchema = new Schema(
  {
    name: { type: String, default: "" },
    listUser: [{ type: Schema.Types.ObjectId, ref: "User" }],
    type: { type: String, default: "friend" },
    role: { type: Schema.Types.ObjectId, ref: "User", default: "" },
    des: { type: String, default: "" },
    avatar: {
      type: Object,
      default: { path: "", url: "/images/group.png" },
    },
  },
  { timestamps: true }
);

const RoomModel = models.Room || model("Room", roomSchema);

export default RoomModel;
