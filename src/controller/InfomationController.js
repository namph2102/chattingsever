import InfoModel from "../model/InfoModel.js";
import userModel from "../model/userModel.js";

class InfomationController {
  async addInfomation(userSend, userAccept, type = 1, status = false) {
    try {
      const checkExtended = await InfoModel.findOne({ userSend, userAccept });
      if (checkExtended) {
        const checkReverse = await InfoModel.findOne({
          userAccept: userSend,
          userSend: userAccept,
        });

        if (checkReverse) {
          this.updateInfomation(checkReverse._id, true, 2);
          return false;
        }
        return false;
      }
      InfoModel.create({ userSend, userAccept, type, status });
      return true;
    } catch (err) {
      console.error(err.message);
    }
  }
  async updateInfomation(idInfo, status, type = 2) {
    try {
      const infoTowAccount = await InfoModel.findByIdAndUpdate(idInfo, {
        status,
        type,
      });
      if (status && type == 2 && infoTowAccount) {
        const { userSend, userAccept } = infoTowAccount;
        if (!userAccept || !userSend) throw new Error("Thiếu dữ liệu");
        let [listSends, listAccepcts] = await Promise.all([
          userModel.findById(userSend).select("friends"),
          userModel.findById(userAccept).select("friends"),
        ]);

        if (!listSends) {
          listSends = [];
        } else {
          listSends = listSends.friends;
        }
        if (!listAccepcts) {
          listAccepcts = [];
        } else {
          listAccepcts = listAccepcts.friends;
        }

        if (!listSends.includes(userAccept)) {
          await userModel.findByIdAndUpdate(userSend, {
            $push: { friends: userAccept },
            $inc: { follows: 1 },
          });
        }
        if (!listAccepcts.includes(userSend)) {
          await userModel.findByIdAndUpdate(userAccept, {
            $push: { friends: userSend },
            $inc: { follows: 1 },
          });
        }
      }
    } catch (err) {
      console.error(err.message);
    }
  }
  async getInfoUser(req, res) {
    try {
      const { idUser } = req.body;
      if (!idUser) throw new Error("Thiếu dữ liệu");
      const listInfo =
        (await InfoModel.find({ userAccept: idUser }).populate({
          path: "userSend",
          select: "fullname avatar status",
        })) || [];

      return res.status(200).json({
        listInfo,
        status: 200,
        message: "oke",
      });
    } catch (err) {
      res.status(403).json({ message: err.message });
    }
  }
}
export default new InfomationController();
