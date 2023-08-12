/**
 * Introspect response
 */
export interface IntrospectResponse {
  /**
   * Whether the token is active.
   */
  active: boolean;

  /**
   * The client id.
   */
  client_id: string;

  /**
   * The user's email address.
   */
  username: string;

  /**
   * Expiration time in seconds since Unix epoch.
   */
  exp?: number;
}