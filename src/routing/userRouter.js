import express from "express";
import UserController from "../controller/UserController.js";
import CommentController from "../controller/CommentController.js";
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
  .get("/", (req, res) => res.send("Well come my website"))
  .post("/crawlink", CommentController.CrawLink)
  .post("/changepassword", UserController.changePassword);

export default UserRouter;
