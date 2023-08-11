import { Schema, Types, model } from "mongoose";
import { USER_SCHEMA } from "../../users/constants/schemas";
import { RefreshToken } from "../domain/refreshToken";
import { AuditableSchema } from "../../../shared/dataAccess/auditable";

/**
 * The name of the refresh token schema.
 */
const REFRESH_TOKEN_SCHEMA = "RefreshToken";

/**
 * The Mongoose schema for the refresh token entity.
 */
const refreshTokenSchema = new Schema<RefreshToken>({
  userId: { type: Types.ObjectId, ref: USER_SCHEMA, required: true },
  hashedTokenIdentifier: { type: String, required: true },
  expiredAt: { type: Date, required: true },
  usedAttempts: { type: Number, default: 0 },
});

// Add the audit fields to the schema
refreshTokenSchema.add(AuditableSchema);
refreshTokenSchema.index({ userId: 1, hashedTokenIdentifier: 1 }, { unique: true });
refreshTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

/**
 * The Mongoose model for the refresh token entity.
 */
const RefreshTokenModel = model<RefreshToken>(REFRESH_TOKEN_SCHEMA, refreshTokenSchema);

export { RefreshTokenModel, REFRESH_TOKEN_SCHEMA }