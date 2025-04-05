import mongoose from "mongoose";

export const connectDB = async () => {
  const MONGODB_URI =
    "mongodb+srv://rajeshchodavarapu3:rajesh123@cluster0.jic80yz.mongodb.net";
  await mongoose
    .connect(MONGODB_URI)
    .then(() => console.log("Database connected"));
};
