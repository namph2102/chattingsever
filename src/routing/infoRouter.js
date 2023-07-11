import express from "express";
import InfomationController from "../controller/InfomationController.js";
const router = express.Router();
//info

router
  .post("/notice", InfomationController.getInfoUser)
  .post("/accept/friends", InfomationController.getListInfomationWatingAccept)
  .post("/notice/call", InfomationController.getListCommentCall);
export default router;
