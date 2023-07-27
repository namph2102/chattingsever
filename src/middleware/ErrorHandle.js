// ErrorHandler.js
const ErrorHandler = (err, req, res, next) => {
  try {
    console.log(err.message);
    const errStatus = err.statusCode || 500;
    const errMsg = err.message || "Something went wrong";

    res.status(203).json({
      success: false,
      status: errStatus,
      message: errMsg,
      stack: process.env.NODE_ENV === "development" ? err.stack : {},
    });
  } catch {}
};
export const handleErrorTryCatch = (controller) => async (req, res, next) => {
  try {
    await controller(req, res);
  } catch (err) {
    ErrorHandler(err);
  }
};

export default ErrorHandler;
