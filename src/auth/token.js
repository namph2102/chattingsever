import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import * as argon2 from "argon2";
import UserModel from "../model/userModel.js";
class EncodeHandle {
  #accessToken = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";
  #refreshToekn = process.env.REFRESH_TOKEN_SERCRET || "REFRESH_TOKEN_SERCRET";
  generateToken(username, isAccessToken = true, expiresIn = "5h") {
    let result;

    if (isAccessToken) {
      result = sign({ username }, this.#accessToken, { expiresIn: "1h" });
    } else
      result = sign({ username }, this.#refreshToekn, { expiresIn: "10d" });
    return result;
  }
  verifyToken(token) {
    return verify(token, this.#accessToken, (err, decoded) => {
      if (err) {
        if (err.message.includes("jwt expired"))
          return { message: "Token hết hạn", status: -1 };
        return { message: err.message, status: 0 };
      }
      return { message: "token chính xác", status: 1, ...decoded };
    });
  }
  async generatePassword(password) {
    try {
      const result = await argon2.hash(password);
      return result;
    } catch (error) {
      return null;
    }
  }
  async verifyPassword(passwordHash, password) {
    try {
      const result = await argon2.verify(passwordHash, password);
      return result;
    } catch (error) {
      return false;
    }
  }
  async refreshToken(username) {
    const accessToken = this.generateToken(username, true);
    const refreshToken = this.generateToken(username, false);

    username &&
      (await UserModel.updateOne({ username }, { accessToken, refreshToken }));
    return { accessToken, refreshToken };
  }
}

export default new EncodeHandle();
