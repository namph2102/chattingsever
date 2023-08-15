import UserModel from "../model/userModel.js";
import EncodeHandle from "./token.js";
import InfoModel from "../model/InfoModel.js";
class Authentication {
  async firstLogin(req, res) {
    try {
      const [_, accessToken] = req.headers["authorization"].split(" ");

      if (accessToken) {
        // check token có trong db ko
        const account = await UserModel.findOneAndUpdate(
          { accessToken, blocked: false },
          {
            status: true,
            $inc: { joinWeb: 1 },
            timeOff: new Date().toISOString(),
          }
        );
        if (!account) {
          throw new Error("Không tồn tại token này!");
        } else if (account.blocked) {
          throw new Error("Tài khoản đã bị khóa");
        }

        const result = EncodeHandle.verifyToken(accessToken);

        switch (result.status) {
          case -1:
            /// token hết hạn
            const { accessToken, refreshToken } =
              await EncodeHandle.refreshToken(account.username);
            account.accessToken = accessToken;
            account.refreshToken = refreshToken;

            break;
          case 0:
            // token này không chính xác
            throw new Error("Token không chính xác");

          case 1:
            // token còn hạn
            break;
          default:
            throw new Error(result.message);
        }
        const totalInfos =
          (await InfoModel.find({
            userAccept: account._id,
            isSee: false,
          }).count()) || 0;

        delete account.password;

        return res.status(200).json({
          account,
          message: "first login successful",
          status: 200,
          totalInfos,
        });
      }
      throw new Error("Thiếu accesstoken");
    } catch (err) {
      console.log(err.message);
      res.status(401).json({ message: err.message });
    }
  }
  async AccuracyAccessToken(req, res, next) {
    try {
      const [_, accessToken] = req.headers["authorization"].split(" ");
      console.log("Đang Xác thực tài khoản");
      if (accessToken) {
        // check token có trong db ko
        const account = await UserModel.findOne({
          accessToken,
          blocked: false,
        });

        if (account) {
          next();
        }
      }
    } catch (err) {
      console.log(err.message);
    }
  }
  async AccuracyPermission(req, res, next) {
    try {
      const [_, accessToken] = req.headers["authorization"].split(" ");

      if (accessToken) {
        // check token có trong db ko
        const account = await UserModel.findOne({
          accessToken,
          blocked: false,
        });

        if (account && account.permission !== "member") {
          next();
        }
      }
    } catch (err) {
      console.log("Bạn ko phải là quản trị viên");
      console.log(err.message);
    }
  }
  async AccuracyOnlyZecky(req, res, next) {
    try {
      const [_, accessToken] = req.headers["authorization"].split(" ");
      console.log("Đang Xác thực tài khoản");
      if (accessToken) {
        // check token có trong db ko
        const account = await UserModel.findOne({
          accessToken,
          blocked: false,
        });

        if (account && account.permission == "zecky") {
          console.log(" Xác thực tài khoản quản trị viên cấp cao thành công");
          next();
        }
      }
    } catch (err) {
      console.log("Bạn ko phải là quản trị viên cấp cao");
      console.log(err.message);
    }
  }
}
export default new Authentication();
