import express from "express";
import InfomationController from "../controller/InfomationController.js";
import { handleErrorTryCatch } from "../middleware/ErrorHandle.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//info

router
  .post("/notice", InfomationController.getInfoUser)
  .post("/accept/friends", InfomationController.getListInfomationWatingAccept)
  .post("/notice/call", InfomationController.getListCommentCall)
  .post(
    "/updatestatus",

    InfomationController.updateAllStatus
  )
  .delete(
    "/admin/:id",
    Authentication.AccuracyPermission,
    handleErrorTryCatch(InfomationController.handleDeleteNotice)
  );
export default router;
