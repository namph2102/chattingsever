import UserModel from "../model/userModel.js";
import EncodeHandle from "../auth/token.js";
import { createCookie } from "../auth/cookieUtil.js";

class Usercontroller {
  async isCheckExtened(username) {
    const findAccount = await UserModel.findOne({ username });
    return findAccount || false;
  }
  async handleSearch(req, res) {
    try {
      console.log(req.body);
      const { search } = req.body;
      console.log(search);
      if (!search) {
        throw new Error("Dữ liệu thiếu");
      }
      let listUserSearchs =
        (await UserModel.find({
          $text: { $search: search },
        }).select("username fullname avatar")) || [];

      return res.status(200).json({
        listUserSearchs,
        status: 200,
        messsage: "Tìm thấy user",
      });
    } catch (err) {
      console.log(err);
      return res.status(404).json({ messgae: err.message, status: 404 });
    }
  }
  async createAccount(req, res) {
    try {
      const {
        data: { fullname, password, username },
      } = req.body;
      if (!fullname || !password || !fullname) {
        throw new Error("Thiếu dữ liệu !");
      }
      const isExteend = await this.isCheckExtened(username);
      if (isExteend) {
        throw new Error("Tài khoản đã tồn tại !");
      }
      const accessToken = EncodeHandle.generateToken({ username }, true);
      const refreshToken = EncodeHandle.generateToken({ username }, false);
      const passwordHash = await EncodeHandle.generatePassword(password);
      createCookie(res, "refreshToken", refreshToken);
      const dataCreate = {
        username,
        password: passwordHash,
        fullname,
        accessToken,
        refreshToken,
      };
      const newAccount = await UserModel.create(dataCreate);

      res.status(201).json({
        message: "Tạo tài khoản thành công!",
        account: newAccount,
        status: 201,
      });
    } catch (error) {
      console.log(error.message);
      res.status(404).json({ message: error.message, status: 404 });
    }
  }
}
export default new Usercontroller();
