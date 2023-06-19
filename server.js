import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
const app = express();
import * as dotenv from "dotenv";
dotenv.config();
import cors from "cors";
import cookieParser from "cookie-parser";
import { engine } from "express-handlebars";

//* setting path
import path from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";
import ConnectDatabase from "./src/servies/conectMongoose.js";
import AllRouter from "./src/routing/index.js";
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
const listPeers = [];
app.get("/home", (req, res) => {
  res.send("Hello World!");
});

import handleSocketCall from "./src/socket/index.js";
import UserChatSocket from "./src/socket/userchat.js";

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
