import UserRouter from "./userRouter.js";
import zingRouter from "./ZingRouter.js";
import RoomRouter from "./roomRouter.js";
import InfoRouter from "./infoRouter.js";
import BlogRouter from "./blogRouter.js";
import CateRouter from "./cateRouter.js";
import Adminrouter from "./adminRouter.js";
import ErrorHandler from "../middleware/ErrorHandle.js";

function AllRouter(app) {
  app.use("/user", UserRouter);
  app.use("/music", zingRouter);
  app.use("/room", RoomRouter);
  app.use("/info", InfoRouter);
  app.use("/blog", BlogRouter);
  app.use("/cate", CateRouter);
  app.use("/admin", Adminrouter);
  app.use(ErrorHandler);
}
export default AllRouter;
