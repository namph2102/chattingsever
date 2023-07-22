import express from "express";
import BlogController from "../controller/BlogController.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//blog
router
  .get("/allblog", BlogController.getAllblogStatusTrue)
  .post("/admin/blog", BlogController.allblogDashboard)
  .post("/create", Authentication.AccuracyPermission, BlogController.CreateBlog)
  .post("/detail", BlogController.getBlog)
  .post("/admin/search", BlogController.handleSearchDashboard)
  .delete(
    "/admin/delete/:blogid",
    Authentication.AccuracyPermission,
    BlogController.handleDelete
  )
  .patch(
    "/admin/edit",
    Authentication.AccuracyPermission,
    BlogController.BlogEdit
  );

export default router;
