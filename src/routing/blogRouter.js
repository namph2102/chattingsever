import express from "express";
import BlogController from "../controller/BlogController.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//blog
router
  .post("/topblog", BlogController.getTopBlog)
  .get("/allblog", BlogController.getAllblogStatusTrue)
  .post("/admin/blog", BlogController.allblogDashboard)
  .post("/create", Authentication.AccuracyPermission, BlogController.CreateBlog)
  .post("/detail", BlogController.getBlog)
  .post("/admin/search", BlogController.handleSearchDashboard)
  .post("/admin/craw", BlogController.CrawLinkBlog)
  .post("/search", BlogController.handleSearchPage)
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
