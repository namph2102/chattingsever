import express from "express";
import UserController from "../controller/UserController.js";
const UserRouter = express.Router();
// path parent "/user"
UserRouter.post("/create", UserController.createAccount.bind(UserController))
  .post("/search", UserController.handleSearch)
  .get("/", (req, res) => res.send("hello"));
export default UserRouter;
