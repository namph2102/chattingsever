import UserModel from "../model/userModel.js";
import EncodeHandle from "./token.js";

class Authentication {
  async firstLogin(req, res) {
    try {
      const [_, accessToken] = req.headers["authorization"].split(" ");

      if (accessToken) {
        // check token có trong db ko
        const account = await UserModel.findOneAndUpdate(
          { accessToken },
          { status: true }
        );
        if (!account) {
          throw new Error("Không tồn tại token này!");
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

        return res
          .status(200)
          .json({ account, message: "first login successful", status: 200 });
      }
      throw new Error("Thiếu accesstoken");
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  }
  async AccuracyPermission(req, res, next) {
    try {
      const [_, accessToken] = req.headers["authorization"].split(" ");
      console.log("Xác thực tài khoản");
      if (accessToken) {
        // check token có trong db ko
        const account = await UserModel.findOneAndUpdate(
          { accessToken },
          { status: true }
        );

        if (account && account.permission !== "member") {
          next();
        }
      }
    } catch (err) {
      console.log("Bạn ko phải là quản trị viên");
      console.log(err.message);
    }
  }
}
export default new Authentication();
