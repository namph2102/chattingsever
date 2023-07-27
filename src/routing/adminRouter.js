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
  );

export default router;
