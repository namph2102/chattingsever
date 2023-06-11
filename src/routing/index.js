import UserRouter from "./userRoute.js";
import zingRouter from "./ZingRouter.js";

function AllRouter(app) {
  app.use("/user", UserRouter);
  app.use("/music", zingRouter);
}
export default AllRouter;
