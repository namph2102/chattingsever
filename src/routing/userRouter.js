import express from "express";
import UserController from "../controller/UserController.js";
import Authentication from "../auth/Authentication.js";
const UserRouter = express.Router();
// path parent "/user"
UserRouter.post("/create", UserController.createAccount.bind(UserController))
  .post("/login/firebase", UserController.loginWithFireBase)
  .get("/firstlogin", Authentication.firstLogin)
  .post("/search", UserController.handleSearch)
  .post("/page/search", UserController.handleSerachPage)
  .post("/login", UserController.loginAccount.bind(UserController))
  .post("/listfriend", UserController.getListFriend)
  .get("/", (req, res) => res.send("hello"));

export default UserRouter;
