import { Schema, Types, model } from "mongoose";
import { USER_SCHEMA } from "../constants/schemas";
import { User } from "../domain/user";
import { AuditableSchema } from "../../../shared/dataAccess/auditable";

/**
 * The Mongoose schema for the user entity.
 */
const UserSchema = new Schema<User>({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, maxLength: 10, minLength: 10 },
  providers: { googleId: { type: String, required: true } },
  tokens: [{ type: Types.ObjectId }]
});

// Add the audit fields to the schema
UserSchema.add(AuditableSchema);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ "providers.googleId": "text" }, { unique: true });

/**
 * The Mongoose model for the user entity.
 */
export const UserModel = model<User>(USER_SCHEMA, UserSchema);
