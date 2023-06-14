import express from "express";
import RoomController from "../controller/RoomController.js";

const roomRouter = express.Router();
// /room;
roomRouter.post("/create", RoomController.getInfoRoom);
export default roomRouter;
