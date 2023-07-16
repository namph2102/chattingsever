import UserRouter from "./userRouter.js";
import zingRouter from "./ZingRouter.js";
import RoomRouter from "./roomRouter.js";
import InfoRouter from "./infoRouter.js";
import BlogRouter from "./blogRouter.js";
function AllRouter(app) {
  app.use("/user", UserRouter);
  app.use("/music", zingRouter);
  app.use("/room", RoomRouter);
  app.use("/info", InfoRouter);
  app.use("/blog", BlogRouter);
}
export default AllRouter;
