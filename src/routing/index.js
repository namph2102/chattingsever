import UserRouter from "./userRouter.js";
import zingRouter from "./ZingRouter.js";
import RoomRouter from "./roomRouter.js";
function AllRouter(app) {
  app.use("/user", UserRouter);
  app.use("/music", zingRouter);
  app.use("/room", RoomRouter);
}
export default AllRouter;
