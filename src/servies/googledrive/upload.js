import { google } from "googleapis";
import casual from "casual";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();

const authenticateGoogle = () => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./public/authenzecky.json",
    scopes: "https://www.googleapis.com/auth/drive",
  });
  return auth;
};
const driveService = google.drive({
  version: "v3",
  auth: authenticateGoogle(),
});
class GoogleDrive {
  async uploadfile(file) {
    const createfile = await driveService.files.create({
      requestBody: {
        name: casual.uuid + ".mp3",
        parents: ["1-QoRkEvWVldDUg0XbMuCl_tHRTsizuxI"],
      },
      media: {
        mimeType: "video/*",
        body: fs.createReadStream(file),
      },
    });
    // console.log(createfile.data);
    return createfile.data.id;
  }
  async getFile(fileId) {
    try {
      const getUrl = await driveService.files.get({
        fileId,
        fields: "webViewLink,webContentLink",
      });
      const fileLink = getUrl.data.webViewLink;
      // console.log("webViewLink:", fileLink);
      // console.log("webContentLink:", getUrl.data.webContentLink);
    } catch (error) {
      console.error("Lỗi lấy path file:", error.message);
    }
  }
  async deletefile(fileId) {
    try {
      await driveService.files.delete({
        fileId: fileId,
      });
      console.log("File đã được xóa thành công");
    } catch (error) {
      console.error("Lỗi xóa file:", error.message);
    }
  }
}

export default new GoogleDrive();
