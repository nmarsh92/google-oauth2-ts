import { Schema, Types, model } from "mongoose";
import { AuditableSchema } from "../../../shared/domain/auditable";
import { USER_SCHEMA } from "../../users/constants/schemas";
import { RefreshToken } from "../domain/refreshToken";

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
  usedAttempts: { type: Number, default: 0 }
});

// Add the audit fields to the schema
refreshTokenSchema.add(AuditableSchema);

/**
 * The Mongoose model for the refresh token entity.
 */
const RefreshTokenModel = model<RefreshToken>(REFRESH_TOKEN_SCHEMA, refreshTokenSchema);

export { RefreshTokenModel, REFRESH_TOKEN_SCHEMA }