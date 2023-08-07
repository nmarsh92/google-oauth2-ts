/**
 *  Token request.
 */
export interface TokenRequest {
  /**
   *   Grant type.
   */
  grant_type: string;

  /**
   *  Refresh token.
   */
  refresh_token: string;

  /**
   *  Client id.
   */
  client_id: string;
}