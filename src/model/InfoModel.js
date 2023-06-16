import pkg from "mongoose";
const { Schema, model, models } = pkg;
//type
/**
 * 1 Thông báo gửi cho người nhân kết bạn
 * 2 kết quả phần hồi kết bạn >status:true chấp nhận, false từ chối
 *
 */
const infoSchema = new Schema(
  {
    userSend: { type: Schema.Types.ObjectId, ref: "User", require: true },
    userAccept: { type: Schema.Types.ObjectId, ref: "User", require: true },
    type: { type: String, default: 1 },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InfoModel = models.Info || model("Info", infoSchema);

export default InfoModel;
