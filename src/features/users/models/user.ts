
import { Schema, Types, model } from "mongoose";
import { AuditableSchema, Auditable } from "../../../shared/models/auditable";
import { HasId } from "../../../shared/models/hasId";
import { UserProviders } from "./userProviders";
import { UserActivity } from "./userActivity";
import { RefreshToken } from "../../token/models/refreshToken";
import { USER_ACTIVITY_SCHEMA, USER_SCHEMA } from "../constants/schemas";

/**
 * Represents a User entity.
 * @interface
 * @extends {Auditable}
 */
interface User extends Auditable, HasId {
  /**
 * The email address of the user.
 * @type {string}
 */
  email: string;

  /**
   * The first name of the user.
   * @type {string}
   */
  firstName: string;

  /**
   * The last name of the user. 
   * @type {string}
   */
  lastName: string;

  /**
   * The phone number of the user.
   * @type {string}
   */
  phone?: string;
  providers: UserProviders,
  // activity: Array<UserActivity>
  tokens: Array<RefreshToken>
}

const UserSchema = new Schema<User>({
  email: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  phone: { type: String, maxLength: 10, minLength: 10 },
  providers: { googleId: { type: String, required: true } },
  // activity: [{ type: Types.ObjectId, ref: USER_ACTIVITY_SCHEMA }],
  tokens: [{ type: Types.ObjectId }]
});

UserSchema.add(AuditableSchema);

const UserModel = model<User>(USER_SCHEMA, UserSchema);

export { User, UserModel }