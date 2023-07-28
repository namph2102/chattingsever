import express from "express";
import DashBoardController from "../controller/DashBoardController.js";
import Authentication from "../auth/Authentication.js";
import { handleErrorTryCatch } from "../middleware/ErrorHandle.js";
const router = express.Router();
//admin
router
  .post(
    "/pagehome",
    Authentication.AccuracyPermission,
    DashBoardController.homepage
  )
  .get(
    "/listaccount",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.getListAccountAdmin)
  )
  .post(
    "/listnotice",
    Authentication.AccuracyPermission,
    handleErrorTryCatch(DashBoardController.getListnotice)
  )
  .post(
    "/fullaccount",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.getFullAccount)
  )
  .put(
    "/updateaccount",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.UpdateAccount)
  )
  .delete(
    "/account/:idAccount",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.deleteAccount)
  )
  .post(
    "/comment/document",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.listcommentDocument)
  )
  .post(
    "/drive",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.getAllListFileGoogleDrive)
  )
  .put(
    "/drive/deleteone",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.deleteOneDocument)
  )
  .delete(
    "/comment/document/:idComment",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.deleteDocumentComment)
  )
  .delete(
    "/notice/:idUser",
    Authentication.AccuracyPermission,
    handleErrorTryCatch(DashBoardController.deleteNotice)
  )
  .delete(
    "/noticeall",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(DashBoardController.deleteAllNotice)
  );

export default router;
