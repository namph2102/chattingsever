import UserRouter from "./userRoute.js";

function AllRouter(app) {
  app.use("/user", UserRouter);
}
export default AllRouter;
