/**
 * Revoke request.
 */
export interface RevokeRequest {

  /** 
   * Refresh token.
   * 
   * */
  refresh_token: string;

  /**
   * Client id.
   * */
  client_id: string;
}