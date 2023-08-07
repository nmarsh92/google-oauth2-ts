/**
 *  Authentication request.
 */
export interface AuthenticationRequest {

  /**
   *  Client id.
   */
  clientId: string;

  /**
   *  Google id token.
   */
  credential: string;
}