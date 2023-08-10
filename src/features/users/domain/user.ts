
import { Auditable } from "../../../shared/domain/auditable";
import { HasId } from "../../../shared/domain/hasId";
import { UserProviders } from "./userProviders";
import { RefreshToken } from "../../token/domain/refreshToken";

/**
 * Represents a User entity.
 * @interface
 * @extends {Auditable}
 */
export interface User extends Auditable, HasId {
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

  /**
   * The authentication providers associated with the user.
   * @type {UserProviders}
   */
  providers: UserProviders,

  /**
   * The refresh tokens associated with the user.
   * @type {Array<RefreshToken>}
   */
  tokens: Array<RefreshToken>
}

