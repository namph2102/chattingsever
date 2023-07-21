import express from "express";
import BlogController from "../controller/BlogController.js";
import Authentication from "../auth/Authentication.js";
const router = express.Router();
//blog
router
  .get("/allblog", BlogController.getAllBlog)
  .post("/create", Authentication.AccuracyPermission, BlogController.CreateBlog)
  .post("/detail", BlogController.getBlog);

export default router;
