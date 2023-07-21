import express from "express";
import CateController from "../controller/CateController.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//cate
router
  .get("/", CateController.getAllCate)
  .post("/ceate", Authentication.AccuracyPermission, CateController.createCate)
  .post("/getslug", CateController.getCateSlug);

export default router;
