import express from "express";
import DashBoardController from "../controller/DashBoardController.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//admin
router.get(
  "/pagehome",
  Authentication.AccuracyPermission,
  DashBoardController.homepage
);

export default router;
