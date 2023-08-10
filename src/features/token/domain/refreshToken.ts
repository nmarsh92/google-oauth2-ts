import { ObjectId } from "mongoose";
import { Auditable } from "../../../shared/domain/auditable";
import { User } from "../../users/domain/user";
import { HasId } from "../../../shared/domain/hasId";

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



export { RefreshToken }