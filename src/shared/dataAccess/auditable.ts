import { Schema } from "mongoose";

export const AuditableSchema = new Schema(
  {
    isDeleted: { type: Boolean, default: false }
  },
  { optimisticConcurrency: true, timestamps: true }
);