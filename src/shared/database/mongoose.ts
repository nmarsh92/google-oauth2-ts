import mongoose from "mongoose";

export const connect = async () => {
  const db: string = process.env.DB || "";
  return mongoose.connect(db);
};