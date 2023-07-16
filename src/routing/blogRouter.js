import express from "express";
import BlogController from "../controller/BlogController.js";
const router = express.Router();

router
  .get("/allblog", BlogController.getAllBlog)
  .post("/detail", BlogController.getBlog);

export default router;
