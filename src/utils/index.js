import casual from "casual";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import GoogleDrive from "../servies/googledrive/upload.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
export const base64ToFile = async (base64String) => {
  try {
    if (!base64String) throw new Error("Thiếu dữ liệu");

    const pathLink = path.join(__dirname, "public", casual.uuid + ".mp3");
    let filePath = pathLink.replace(/[\\\/](?:src[\/|\\]utils)[\\\/]/g, "/");

    console.log("filePath", filePath);

    // Xóa tiền tố của chuỗi Base64 (data:audio/webm;base64, ...)
    const base64Data = base64String.replace(/^data:audio\/webm;base64,/, "");
    // Tạo một Buffer từ chuỗi Base64
    const buffer = Buffer.from(base64Data, "base64");
    // Ghi buffer vào tệp
    fs.writeFileSync(filePath, buffer, { encoding: "base64" });

    const idFile = await GoogleDrive.uploadfile(filePath);
    console.log("idFile", idFile);
    if (idFile) {
      fs.unlink(filePath, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
          return;
        }

        console.log("File deleted successfully.");
      });
    }
    return idFile;
  } catch (err) {
    console.log("sever error message", err.message);
    return null;
  }
};
