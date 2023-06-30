import express from "express";
import RoomController from "../controller/RoomController.js";

const roomRouter = express.Router();
// /room;
roomRouter
  .post("/create", RoomController.getInfoRoom)
  .get("/", (req, res) => {
    res.send("Trang home test");
  })
  .patch("/update/settings", RoomController.UpdateRoomSettings);
export default roomRouter;
