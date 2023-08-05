import { ObjectId, Schema, Types, model } from "mongoose";
import { AuditableSchema, Auditable } from "../../../shared/models/auditable";
import { User } from "../../users/models/user";
import { HasId } from "../../../shared/models/hasId";
import { USER_SCHEMA } from "../../users/constants/schemas";

const REFRESH_TOKEN_SCHEMA = "RefreshToken";
/**
 * Interface representing the user credentials.
 * @interface RefreshToken
 */
interface RefreshToken extends Auditable, HasId {
  /**
   * The Google ID of the user.
   * @type {string}
   */
  userId: User | ObjectId;

  /**
   * Hashed refresh token.
   */
  hashedTokenIdentifier: string;

  /**
   *  Expired at
   */
  expiredAt: Date,

  /**
   * Number of attempted uses.
   */
  usedAttempts: number
}

const refreshTokenSchema = new Schema<RefreshToken>({
  userId: { type: Types.ObjectId, ref: USER_SCHEMA, required: true },
  hashedTokenIdentifier: { type: String, required: true },
  expiredAt: { type: Date, required: true },
  usedAttempts: { type: Number, default: 0 }
});

refreshTokenSchema.add(AuditableSchema);

const RefreshTokenModel = model<RefreshToken>(REFRESH_TOKEN_SCHEMA, refreshTokenSchema);

export { RefreshToken, RefreshTokenModel, REFRESH_TOKEN_SCHEMA }