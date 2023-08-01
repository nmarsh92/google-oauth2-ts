import mongoose from "mongoose";

/**
 * Connects to the MongoDB database using the provided configuration.
 *
 * @throws {Error} If the database configuration is missing.
 * @returns {Promise<typeof mongoose>} A promise that resolves when the connection is successful or rejects if an error occurs.
 */
export const connect = () => {
  const db = process.env.DB;
  if (!db) throw Error("Missing database configuration");
  return mongoose.connect(db);
};