import mongoose from "mongoose";

// Connects to MongoDB. Fails fast (5s) when the server is not reachable.
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB connected");
};

export default connectDB;
