import express from "express";
import InfomationController from "../controller/InfomationController.js";
const router = express.Router();
//info

router.post("/notice", InfomationController.getInfoUser);
export default router;
