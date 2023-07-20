import { google } from "googleapis";
import casual from "casual";

import fs from "fs";
import * as dotenv from "dotenv";
dotenv.config();
import { fileURLToPath } from "url";
import path, { dirname } from "path";
const __dirname = dirname(fileURLToPath(import.meta.url));
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
    try {
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
    } catch (error) {
      console.log("Upload file error", error.message);
      return null;
    }
  }
  async UploadFileMore(fileUpload) {
    // const fileUpload = {
    //   name: "",
    //   mimetype: "",
    //   path: "",
    //   size: 0,
    //   filename: "",
    // };
    try {
      const createfile = await driveService.files.create({
        requestBody: {
          name: fileUpload.filename,
          parents: ["1-QoRkEvWVldDUg0XbMuCl_tHRTsizuxI"],
        },
        media: {
          mimeType: fileUpload.mimetype,
          body: fs.createReadStream(fileUpload.path),
        },
      });

      const urlDownload = await this.getFile(createfile.data.id);
      return {
        url: urlDownload,
        fileName: fileUpload.filename,
        path: createfile.data.id,
        size: fileUpload.size,
      };
    } catch (error) {
      console.log("Upload file error", error.message);
      return null;
    }
  }
  async getFile(fileId) {
    try {
      const getUrl = await driveService.files.get({
        fileId,
        fields: "webViewLink,webContentLink",
      });
      const fileLink = getUrl.data.webContentLink;

      return fileLink;
    } catch (error) {
      console.error("Lỗi lấy path file:", error.message);
    }
  }
  async deletefile(fileId) {
    try {
      await driveService.files.delete({
        fileId: fileId,
      });
    } catch (error) {
      console.error("Lỗi xóa file:", error.message);
    }
  }
}

export default new GoogleDrive();
