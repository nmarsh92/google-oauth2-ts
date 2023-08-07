import { JwtPayload } from "jsonwebtoken";

/**
 * Interface representing the payload of an access token.
 */
export interface TokenPayload extends JwtPayload {
  /**
   * The email associated with the user.
   */
  email: string;

  /**
   * The first name of the user.
   */
  firstName: string;

  /**
   * The last name of the user.
   */
  lastName: string;

  /**
   * Client id.
   */
  client_id: string;
}

/**
 * Interface representing the payload of a refresh token.
 * Extends the ITokenPayload interface to include additional properties.
 */
export interface RefreshTokenPayload extends TokenPayload {
  /**
   * The unique identifier of the refresh token.
   */
  key: string;
}