import mongoose from "mongoose";

// let isConnected = false;

export const connectDB = async () => {
  // mongoose.set("strictQuery", true);

  if (!process.env.MONGO_URL) return console.log("MONGO_URL is undefined");
  // if (isConnected) return console.log("Already connected to database");

  try {
    await mongoose.connect(process.env.MONGO_URL);

    // isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error)
  }
};
