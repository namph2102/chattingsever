import UserModel from "../model/userModel.js";
import EncodeHandle from "../auth/token.js";
import { createCookie } from "../auth/cookieUtil.js";

class Usercontroller {
  async isCheckExtened(username) {
    const findAccount = (await UserModel.findOne({ username })) || false;
    return findAccount;
  }
  async handleSearch(req, res) {
    try {
      const { search } = req.body;
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
      return res.status(404).json({ messgae: err.message, status: 404 });
    }
  }
  async createAccount(req, res) {
    try {
      const {
        data: {
          fullname,
          password,
          username,
          avatar = "/images/defaultlavata.png",
          uid = "",
        },
      } = req.body;
      if (!fullname || !password || !fullname) {
        throw new Error("Thiếu dữ liệu !");
      }
      const isExteend = await this.isCheckExtened(username);
      if (isExteend) {
        throw new Error("đã tồn tại !");
      }
      const accessToken = EncodeHandle.generateToken(username, true);
      const refreshToken = EncodeHandle.generateToken(username, false);
      const passwordHash = await EncodeHandle.generatePassword(password);
      createCookie(res, "refreshToken", refreshToken);
      const dataCreate = {
        username,
        password: passwordHash,
        fullname,
        uid,
        accessToken,
        refreshToken,
        avatar,
      };
      const newAccount = await UserModel.create(dataCreate);

      res.status(201).json({
        message: "Tạo tài khoản thành công!",
        account: newAccount,
        status: 201,
      });
    } catch (error) {
      res.status(404).json({ message: error.message, status: 404 });
    }
  }
  async loginAccount(req, res) {
    try {
      const { username, password } = req.body?.data;
      if (!username || !password) {
        res.status(422).json({ message: "Dữ liệu bị thiếu !", status: 422 });
        return;
      }
      const account = await this.isCheckExtened(username);
      if (account) {
        const isVerify = await EncodeHandle.verifyPassword(
          account.password,
          password
        );

        if (isVerify) {
          const listToken = await EncodeHandle.refreshToken(username);
          account.accessToken = listToken.accessToken;
          account.refreshToken = listToken.refreshToken;
          return res.status(200).json({
            account,
            status: "login oke",
            message: "Đăng nhập thành công!",
          });
        }
      }
      throw new Error("Có lẻ tài khoản và mật khẩu chưa đúng!");
    } catch (err) {
      res.status(401).json({ message: err.message, status: 401 });
    }
  }
  async loginWithFireBase(req, res) {
    // nếu id bị trùng thì register thất bại
    try {
      const { uid, username } = req.body.data;
      if (!uid) throw new Error("Tài khoản chưa đăng ký!");
      let account = await UserModel.findOne({ uid });
      if (username) {
        account = await UserModel.findOne({ username });
      } else {
        account = await UserModel.findOne({ uid });
      }

      if (account) {
        delete account.password;

        return res
          .status(200)
          .json({ account, message: "Đăng nhập thành công" });
      }
      throw new Error("Tài khoản chưa đăng ký!");
    } catch (error) {
      res.status(403).json({ message: error.message, status: 403 });
    }
  }
}
export default new Usercontroller();
