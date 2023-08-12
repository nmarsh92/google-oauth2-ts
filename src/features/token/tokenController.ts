import { NextFunction, Response, Request } from "express"
import { withErrorHandler } from "../../shared/controllerBase"
import { HTTP_STATUS_CODES } from "../../shared/constants/http";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { addAndGetRefreshTokenAsync, revokeAllRefreshTokens, revokeRefreshToken, signAndGetAccessTokenAsync, validateAndGetAccessTokenPayloadAsync, validateAndGetRefreshTokenPayloadAsync } from "./tokenService";
import { TokenRequest } from "./api/tokenRequest";
import { IntrospectRequest } from "./api/introspectRequest";
import { RevokeAllRequest } from "./api/revokeAllRequest";
import { RevokeRequest } from "./api/revokeRequest";
import { IntrospectResponse } from "./api/introspectResponse";

/**
 * Token endpoint to exchange refresh token for access token.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 * @throws {UnauthorizedError} Thrown if the refresh token is invalid.
 * @throws {UnauthorizedError} Thrown if the refresh token is expired.
 * @throws {UnauthorizedError} Thrown if the refresh token is revoked.
 * @throws {UnauthorizedError} Thrown if the refresh token is not found.
 */
export const getToken = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tokenRequest: TokenRequest = req.body; //todo validation
  const refreshTokenPayload = await validateAndGetRefreshTokenPayloadAsync(tokenRequest.refresh_token);

  if (!refreshTokenPayload.key || !refreshTokenPayload.sub || !refreshTokenPayload.aud) throw new UnauthorizedError();

  const access_token = await signAndGetAccessTokenAsync(tokenRequest.client_id, refreshTokenPayload.sub)
  await revokeRefreshToken(refreshTokenPayload.sub, refreshTokenPayload.key);
  const refresh_token = await addAndGetRefreshTokenAsync(refreshTokenPayload.sub, tokenRequest.client_id);

  res.status(HTTP_STATUS_CODES.CREATED).json({ access_token, refresh_token });
});

/**
 * Revoke refresh token.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 * @throws {UnauthorizedError} Thrown if the refresh token is invalid.
 * @throws {UnauthorizedError} Thrown if the refresh token is expired.
 * @throws {UnauthorizedError} Thrown if the refresh token is revoked.
 */
export const revoke = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tokenRequest: RevokeRequest = req.body;
  const refreshTokenPayload = await validateAndGetRefreshTokenPayloadAsync(tokenRequest.refresh_token);
  if (!refreshTokenPayload.sub) throw new UnauthorizedError();

  await revokeRefreshToken(refreshTokenPayload.sub, refreshTokenPayload.key);

  res.status(HTTP_STATUS_CODES.NO_CONTENT).json();
});

/**
 * Revoke all refresh tokens.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 * @throws {UnauthorizedError} Thrown if the access token is invalid.
 * @throws {UnauthorizedError} Thrown if the access token is expired.
 * @throws {UnauthorizedError} Thrown if the access token is revoked.
 */
export const revokeAll = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const request: RevokeAllRequest = req.body;
  const verified = await validateAndGetAccessTokenPayloadAsync(request.access_token, false);
  if (!verified?.sub) throw new UnauthorizedError();
  await revokeAllRefreshTokens(verified.sub);
  res.status(HTTP_STATUS_CODES.NO_CONTENT).json();
});

/**
 * Introspect endpoint to determine access token validity.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 * @throws {UnauthorizedError} Thrown if the access token is invalid.
 * @throws {UnauthorizedError} Thrown if the access token is expired.
 */
export const introspect = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const request: IntrospectRequest = req.body;
  const verified = await validateAndGetAccessTokenPayloadAsync(request.token, false);
  const response: IntrospectResponse = {
    active: !!verified,
    client_id: verified?.client_id,
    username: verified?.email,
    exp: verified?.exp
  }
  res.status(HTTP_STATUS_CODES.OK).json(response)
});
