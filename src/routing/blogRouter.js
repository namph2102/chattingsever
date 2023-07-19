import express from "express";
import BlogController from "../controller/BlogController.js";
const router = express.Router();
//blog
router
  .get("/allblog", BlogController.getAllBlog)
  .post("/create", BlogController.CreateBlog)
  .post("/detail", BlogController.getBlog);

export default router;
