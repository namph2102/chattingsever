import UserModel from "../model/userModel.js";
import NotifyModel from "../model/InfoModel.js";
import RoomModel from "../model/RoomModel.js";
import EncodeHandle from "../auth/token.js";

class Usercontroller {
  async isCheckExtened(username) {
    const findAccount = (await UserModel.findOne({ username })) || false;
    return findAccount;
  }
  async handleSearch(req, res) {
    try {
      const { search, listUserExtended, limit = 100 } = req.body;

      if (!search) {
        throw new Error("Dữ liệu thiếu");
      }
      let listUserSearchs = [];
      if (search == "getall") {
        listUserSearchs =
          (await UserModel.find({
            _id: { $nin: listUserExtended },
          })
            .select("username fullname avatar status")
            .sort({ follows: -1 })) || [];
      } else {
        listUserSearchs =
          (await UserModel.find({
            $text: { $search: search },

            _id: { $nin: listUserExtended },
          })
            .select("username fullname avatar status")
            .limit(limit)
            .sort({ follows: -1 })) || [];
      }

      return res.status(200).json({
        listUserSearchs,
        status: 200,
        messsage: "Tìm thấy user",
      });
    } catch (err) {
      return res.status(404).json({ messgae: err.message, status: 404 });
    }
  }
  async handleSerachPage(req, res) {
    try {
      let { search, listUserExtended, listFriend } = req.body;

      if (!search || !listUserExtended || !listFriend) {
        throw new Error("Dữ liệu thiếu");
      }
      let listUserSearchs = [];

      if (search == "getall") {
        listUserSearchs =
          (await UserModel.find({
            _id: { $nin: listUserExtended },
          })
            .select("username fullname avatar status follows address friends")
            .populate({
              path: "follows",
              match: { _id: { $in: [listFriend] } },
            })
            .populate({ path: "friends", select: "avatar fullname" })
            .sort({ follows: -1 })) || [];
      } else
        listUserSearchs =
          (await UserModel.find({
            $text: { $search: search },

            _id: { $nin: listUserExtended },
          })
            .select("username fullname avatar status follows address friends")
            .populate({
              path: "follows",
              match: { _id: { $in: [listFriend] } },
            })
            .populate({ path: "friends", select: "avatar fullname" })
            .sort({ follows: -1 })) || [];
      const listInfoSend = await NotifyModel.find({
        userSend: listUserExtended[0],
        type: 1,
      }).select("userAccept");

      return res.status(200).json({
        listUserSearchs,
        listInfoSend,
        status: 200,
        messsage: "Tìm thấy user",
      });
    } catch (err) {
      console.log(err.message);
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
      res.status(403).json({ message: error.message, status: 404 });
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
        const listToken = await EncodeHandle.refreshToken(account.username);
        account.accessToken = listToken.accessToken;
        account.refreshToken = listToken.refreshToken;
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
  async getListFriend(req, res) {
    try {
      const idUser = req.body.data;
      if (!idUser) throw new Error("Thiếu dữ liệu");
      const listfriends =
        (await UserModel.findById(idUser)
          .populate({
            path: "friends",
            select: "fullname avatar status updatedAt",
          })
          .populate({
            path: "rooms",
            populate: {
              path: "listUser role",
              select: "fullname avatar status updatedAt status",
            },
            select: "listUser type name avatar des",
          })
          .select("friends rooms")) || [];
      const accountRoom = await UserModel.findById(idUser).select("rooms");
      res
        .status(200)
        .json({ listfriends, accountRoom, message: "oke", status: 200 });
    } catch (err) {
      console.log(err);
      res.status(403).json({ message: err.message, status: 403 });
    }
  }
  async changePassword(req, res) {
    try {
      const { username, password, newpassword } = req.body.data;
      if (!username || !password || !newpassword) {
        throw new Error("Thiếu dữ liệu");
      }

      const result = await UserModel.findOne({ username: username }).select(
        "password"
      );

      if (!result) throw new Error("Tài khoản không tồn tại");
      const checked = await EncodeHandle.verifyPassword(
        result.password,
        password
      );

      if (checked) {
        const newPasswordHash = await EncodeHandle.generatePassword(
          newpassword
        );
        newPasswordHash &&
          (await Promise.all([
            UserModel.findOneAndUpdate(
              { username },
              { password: newPasswordHash }
            ),
            NotifyModel.create({
              userSend: result._id,
              userAccept: result._id,
              type: 6,
              status: true,
              message: "thay đổi mật khẩu thành công",
            }),
          ]));

        res
          .status(201)
          .json({ message: "Thay đổi mật khẩu thành công", statusCode: 201 });
        return;
      } else {
        throw new Error("Mật khẩu cũ không đúng");
      }
    } catch (err) {
      res.status(200).json({ message: err.message, statusCode: 200 });
    }
  }
}
export default new Usercontroller();
