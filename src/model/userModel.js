import pkg from "mongoose";
const { Schema, model, models } = pkg;
//permission   robot, member,admin
const userSchema = new Schema(
  {
    fullname: { type: String, required: true, lowercase: true },
    username: {
      type: String,

      required: true,
      unique: [true, "tài khoản đã tồn tại !"],
    },
    avatar: { type: String, default: "/images/defaultlavata.png" },
    password: { type: String, required: true },
    permission: { type: String, default: "member" },
    blocked: { type: Boolean, default: false },
    status: { type: Boolean, default: true },
    accessToken: { type: String, require: true },
    refreshToken: { type: String, require: true },
    follows: { type: Number, default: 0 },
    address: { type: String, default: "hồ chí minh" },
    phone: { type: Number, default: 0 },
    email: { type: String, default: "" },
    friends: [{ type: Schema.Types.ObjectId, default: [], ref: "User" }],
    favorites: [{ type: Schema.Types.ObjectId, default: [], ref: "User" }],

    rooms: [{ type: Schema.Types.ObjectId, default: [], ref: "Room" }],
  },
  { timestamps: true, autoIndex: true }
);

const UserModel = models.User || model("User", userSchema);

export default UserModel;
