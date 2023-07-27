import pkg from "mongoose";
const { Schema, model, models } = pkg;
//type
/**
 * 1 Thông báo gửi cho người nhân kết bạn
 * 2 kết quả phần hồi kết bạn >status:true chấp nhận, false từ chối
 * 3 Thông báo là bạn đã tạo room thành công
 * 4 Thông báo lên người nhận là mời tham gia room;
 * 5  nếu true là chấp nhập join room , false là từ chuối
 * 6  thông báo người gửi đã làm cái gì đó;
 * 7  thông báo bên trang admin  ()
 *  8  thông báo tạo bài viết thành công
 *
 */
const infoSchema = new Schema(
  {
    userSend: { type: Schema.Types.ObjectId, ref: "User", require: true },
    userAccept: { type: Schema.Types.ObjectId, ref: "User", require: true },
    type: { type: Number, default: 1 },
    message: { type: String, default: "" },
    status: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const InfoModel = models.Info || model("Info", infoSchema);

export default InfoModel;
