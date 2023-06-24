import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { engine } from "express-handlebars";
import multer from "multer";
//* setting path

import path from "path";

import ConnectDatabase from "./src/servies/conectMongoose.js";

import AllRouter from "./src/routing/index.js";
import { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// 100mb
const maxFileSize = 100;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, "public")));
//*end setting path
import compression from "compression";
app.use(
  compression({ level: 6, threshold: 100 * 1000, filter: shouldCompress })
);

function shouldCompress(req, res) {
  if (req.headers["x-no-compression"]) {
    // don't compress responses with this request header
    return false;
  }

  // fallback to standard filter function
  return compression.filter(req, res);
}
// // sử dụng view engine
// app.engine(".hbs", engine({ extname: ".hbs" }));
// app.set("view engine", ".hbs");
// app.set("views", "./views");
// // sử dụng view engine

app.use(cookieParser());
app.use(express.json());
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  /* options */
});
ConnectDatabase();
AllRouter(app);

//********************************************* */
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("file", file);
    cb(null, path.join(__dirname, "public"));
  },
  filename: function (req, file, cb) {
    console.log("file", file);
    cb(null, file.originalname);
  },
});

var upload = multer({ storage: storage });
import GoogleDrive from "./src/servies/googledrive/upload.js";
// nhắn tin bằng đoạn chat
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (req.file) {
      // Xử lý route upload file
      const fileUpload = {
        name: "",
        mimetype: "",
        path: "",
        size: 0,
        filename: "",
      };
      fileUpload.name = req.file.originalname;
      fileUpload.mimetype = req.file.mimetype;
      fileUpload.filename = req.file.filename;
      fileUpload.path = req.file.path;
      fileUpload.size = req.file.size / 1024;
      let fileInform = {};
      if (fileUpload.size / 1024 >= maxFileSize) {
        throw new Error("Dung lượng  File phải nhỏ hơn 100MB");
      } else {
        fileInform = await GoogleDrive.UploadFileMore(fileUpload);
      }

      // Xóa file tạm trên sever
      DeleteFileInServer(fileUpload.path);

      if (!fileInform.path) throw new Error("Upload không thành công");
      return res
        .status(201)
        .json({ fileInform, status: 201, message: "Tải file thành công" });
      // Thực hiện các xử lý với file tại đây fileInform.path là idGoogle drive
    } else {
      throw new Error("Tải file thất bại");
    }
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
});

app.get("/home", (req, res) => {
  res.send("Hello World!");
});

import handleSocketCall from "./src/socket/index.js";
import UserChatSocket from "./src/socket/userchat.js";
import { DeleteFileInServer } from "./src/utils/index.js";

//socket io
//socket.userid == _idCuurent
io.on("connection", (socket) => {
  new handleSocketCall(socket);
  // handle edit gim, delete
  new UserChatSocket(socket, io);
});

const PORT_NUMBER = process.env.PORT || 3000;
//end socket io
httpServer.listen(PORT_NUMBER);
