import UserRouter from "./userRouter.js";
import zingRouter from "./ZingRouter.js";
import RoomRouter from "./roomRouter.js";
import InfoRouter from "./infoRouter.js";

function AllRouter(app) {
  app.use("/user", UserRouter);
  app.use("/music", zingRouter);
  app.use("/room", RoomRouter);
  app.use("/info", InfoRouter);
}
export default AllRouter;
