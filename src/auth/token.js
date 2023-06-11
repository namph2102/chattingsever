import pkg from "jsonwebtoken";
const { sign, verify } = pkg;
import * as argon2 from "argon2";
class EncodeHandle {
  #accessToken = process.env.ACCESS_TOKEN_SECRET || "ACCESS_TOKEN_SECRET";
  #refreshToekn = process.env.REFRESH_TOKEN_SERCRET || "REFRESH_TOKEN_SERCRET";
  generateToken(payload, isAccessToken = true, expiresIn = "5h") {
    let result;

    if (isAccessToken) {
      result = sign(payload, this.#accessToken, { expiresIn });
    } else result = sign(payload, this.#refreshToekn);
    return result;
  }
  verifyToken(token) {
    return verify(token, this.#accessToken);
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
}

export default new EncodeHandle();
