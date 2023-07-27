import pkg from "mongoose";
const { Schema, model, models } = pkg;
//permission   robot, member,admin
//type login  web // facebook// google// github
const userSchema = new Schema(
  {
    fullname: { type: String, required: true, lowercase: true },
    username: {
      type: String,

      required: true,
      unique: [true, "tài khoản đã tồn tại !"],
    },
    avatar: {
      type: String,
      default: "http://flixtv.volkovdesign.com/admin/img/user.svg",
    },
    background: { type: String, default: "/images/background.png" },
    password: { type: String, required: true },
    permission: { type: String, default: "member" },
    blocked: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    accessToken: { type: String, require: true },
    refreshToken: { type: String, require: true },
    follows: { type: Number, default: 0 },
    uid: { type: String, default: "" },
    address: { type: String, default: "Chưa cập nhập" },
    location: { lat: Number, log: Number },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    pathAvatar: { type: String, default: "" },
    pathBackground: { type: String, default: "" },
    friends: [{ type: Schema.Types.ObjectId, default: [], ref: "User" }],
    favorites: [{ type: Schema.Types.ObjectId, default: [], ref: "User" }],
    listFollows: [{ type: Schema.Types.ObjectId, default: [], ref: "User" }],
    rooms: [{ type: Schema.Types.ObjectId, default: [], ref: "Room" }],
    joinWeb: { type: Number, default: 1 },
    timeOff: { type: String, default: new Date().toISOString() },
  },
  { timestamps: true, autoIndex: true }
);

const UserModel = models.User || model("User", userSchema);

export default UserModel;
