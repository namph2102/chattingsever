import pkg from "mongoose";
const { Schema, model, models } = pkg;
//permission   robot, member,admin
const roomSchema = new Schema(
  {
    name: { type: String, default: "" },
    listUser: { type: Array, default: [], of: Schema.Types.ObjectId },
  },
  { timestamps: true }
);

const RoomModel = models.Room || model("Room", roomSchema);

export default RoomModel;
