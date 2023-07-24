import express from "express";
import DashBoardController from "../controller/DashBoardController.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//admin
router.post(
  "/pagehome",
  Authentication.AccuracyPermission,
  DashBoardController.homepage
);

export default router;
