import { OAuth2Client } from "google-auth-library";
import { addAndGetRefreshToken, signAndGetAccessTokenAsync } from "../token/tokenService";
import { getOrCreateUser } from "../users/userService";
import { TokenResponse } from "../token/api/tokenResponse";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { Environment } from "../../shared/environment";

/**
 * Logs in a user with Google OAuth.
 * @param credential credential
 * @param clientId client id
 * @returns Promise<TokenResponse>
 */
export const loginWithGoogle = async (credential: string, clientId: string): Promise<TokenResponse> => {
  // Verify Google OAuth token
  const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET);
  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const ticketPayload = ticket.getPayload();
  if (!ticketPayload?.email_verified) throw new UnauthorizedError("Must verify email.");

  if (!ticketPayload.hd || !Environment.getInstance().verifiedDomains.includes(ticketPayload.hd))
    throw new UnauthorizedError("Invalid email address.");

  const user = await getOrCreateUser(ticketPayload);

  const access_token = await signAndGetAccessTokenAsync(clientId, user.id); // Expires in 30 minutes
  const refresh_token = await addAndGetRefreshToken(user.id, clientId); // Expires in 10 days

  return { access_token, refresh_token };
}