import jwt, { JwtPayload } from "jsonwebtoken";
import { Environment } from "../../shared/environment";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { validateRefreshToken as validateRefreshTokenStore } from "./tokenStore";


/**
 * Validates and retrieves the payload from the provided access token.
 *
 * @param {string} accessToken - The access token to validate and retrieve the payload from.
 * @param {boolean} clientIdRequired - Indicates whether the clientId is required for validation.
 * @param {string} clientId - The clientId associated with the access token, if required.
 * @returns {JwtPayload} The payload from the valid access token.
 * @throws {UnauthorizedError} If the access token is missing, invalid, or validation fails.
 */
export const validateAndGetAccessToken = (accessToken: string, clientIdRequired: boolean, clientId?: string): JwtPayload => {

  if (!accessToken) throw new UnauthorizedError("Access token is required.");
  if (clientIdRequired && !clientId) throw new UnauthorizedError("Client id required.");
  const environment = Environment.getInstance();
  const decoded = jwt.decode(accessToken, { complete: true }) as { payload: JwtPayload } | null;
  if (!decoded || !decoded.payload) throw new UnauthorizedError("Invalid access token.");
  let verified: JwtPayload | null = null;
  const { payload } = decoded;

  if (clientId) {
    // If clientId is provided, verify the token with the specific client secret
    verified = <JwtPayload>jwt.verify(accessToken, environment.getSecret(clientId), {
      subject: payload.sub,
      audience: environment.audience,
      issuer: environment.issuer,
    });

    if (!verified) throw new UnauthorizedError("Invalid access token.");
  } else {
    if (!payload.client_id) throw new UnauthorizedError("Invalid access token");
    // If clientId is not provided, just verify the token without specific client secret
    verified = <JwtPayload>jwt.verify(accessToken, environment.getSecret(payload.client_id), {
      subject: payload.sub,
      audience: environment.audience,
      issuer: environment.issuer
    });


  }
  if (!verified) throw new UnauthorizedError("Invalid access token.");
  return verified;
};

/**
 * Validates and retrieves the payload from the provided refresh token.
 *
 * @param {string} refreshToken - The refresh token to validate and retrieve the payload from.
 * @returns {Promise<JwtPayload>} The payload from the valid refresh token.
 * @throws {UnauthorizedError} If the refresh token is missing, invalid, or validation fails.
 */
export const validateAndGetRefreshToken = async (refreshToken: string): Promise<JwtPayload> => {
  if (!refreshToken) throw new UnauthorizedError("RefreshToken required.");
  const environment = Environment.getInstance();
  const decoded = jwt.decode(refreshToken, { complete: true }) as { payload: JwtPayload } | null;
  if (!decoded || !decoded.payload || !decoded.payload.sub) throw new UnauthorizedError("Invalid refresh token.");
  const { payload } = decoded;
  const verified = <JwtPayload>jwt.verify(refreshToken, environment.getSecret(payload.client_id), {
    subject: payload.sub,
    audience: environment.audience,
    issuer: environment.issuer,
  });

  if (!verified) throw new UnauthorizedError("Invalid access token.");
  await validateRefreshTokenStore(verified.sub, verified.key)
  return verified;
}