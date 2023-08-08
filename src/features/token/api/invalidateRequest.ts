/**
 * Invalidate request.
 */
export interface InvalidateRequest {

  /** 
   * Refresh token.
   * */
  refresh_token: string;

  /**
   * Client id.
   * */
  client_id: string;
}