
import { AuditableDto } from "../../../shared/dtos/auditableDto";
import { HasIdDto } from "../../../shared/dtos/hasIdDto";
import { RefreshToken } from "../../token/domain/refreshToken";
import { UserProvidersDto } from "./userProvidersDto";

/**
 * Represents a User entity.
 * @interface
 * @extends {Auditable}
 */
export interface UserDto extends AuditableDto, HasIdDto {
  /**
 * The email address of the user.
 * @type {string}
 */
  email?: string;

  /**
   * The first name of the user.
   * @type {string}
   */
  firstName?: string;

  /**
   * The last name of the user. 
   * @type {string}
   */
  lastName?: string;

  /**
   * The phone number of the user.
   * @type {string}
   */
  phone?: string;
  providers: UserProvidersDto,
  tokens?: Array<RefreshToken>
}