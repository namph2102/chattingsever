import express from "express";
import CateController from "../controller/CateController.js";
import Authentication from "../auth/Authentication.js";
import { handleErrorTryCatch } from "../middleware/ErrorHandle.js";
const router = express.Router();
//cate
router
  .get("/", CateController.getAllCate)
  .post("/ceate", Authentication.AccuracyPermission, CateController.createCate)
  .post("/getslug", CateController.getCateSlug)
  .post("/blog/slug", CateController.getBlogFollowCate)
  .get(
    "/admin/listcate",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(CateController.getListCateAdmin)
  )
  .put(
    "/admin/update",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(CateController.updateCateAdmin)
  )
  .delete(
    "/admin/delete/:idCate",
    Authentication.AccuracyOnlyZecky,
    handleErrorTryCatch(CateController.deleteCateAdmin)
  );

export default router;
