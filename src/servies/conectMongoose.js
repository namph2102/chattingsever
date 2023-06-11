import mongoose from "mongoose";
let isConnected = false;
const ConnectDatabase = async () => {
  // mongoose.set("strictQuery");
  if (isConnected) {
    console.log("mongodb connected");
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: "webchatting",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("mongodb  is readly connected");
    return;
  } catch (err) {
    console.log("cant connect to monggodb");
    console.log(err.message);
  }
};

export default ConnectDatabase;
