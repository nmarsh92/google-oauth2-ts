import { NextFunction, Response, Request } from "express"
import { withErrorHandler } from "../../shared/controllerBase"
import { HTTP_STATUS_CODES } from "../../shared/constants/http";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { addAndGetRefreshTokenAsync, invalidateRefreshToken, signAndGetAccessTokenAsync, validateAndGetAccessTokenPayloadAsync, validateAndGetRefreshTokenPayloadAsync } from "./tokenService";
import { TokenRequest } from "./api/tokenRequest";
import { IntrospectRequest } from "./api/introspectRequest";

/**
 * Token endpoint to exchange refresh token for access token.
 */
export const getToken = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tokenRequest: TokenRequest = req.body; //todo validation
  const refreshTokenPayload = await validateAndGetRefreshTokenPayloadAsync(tokenRequest.refresh_token);

  if (!refreshTokenPayload.key || !refreshTokenPayload.sub || !refreshTokenPayload.aud) throw new UnauthorizedError();

  const access_token = await signAndGetAccessTokenAsync(tokenRequest.client_id, refreshTokenPayload.sub)
  await invalidateRefreshToken(refreshTokenPayload.sub, refreshTokenPayload.key);
  const refresh_token = await addAndGetRefreshTokenAsync(refreshTokenPayload.sub, tokenRequest.client_id);

  res.status(HTTP_STATUS_CODES.CREATED).json({ access_token, refresh_token });
});

/**
 * Invalidate refresh token.
 */
export const invalidate = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const tokenRequest: TokenRequest = req.body; //todo validation
  const refreshTokenPayload = await validateAndGetRefreshTokenPayloadAsync(tokenRequest.refresh_token);
  if (!refreshTokenPayload.sub) throw new UnauthorizedError();

  await invalidateRefreshToken(refreshTokenPayload.sub, refreshTokenPayload.key);

  res.status(HTTP_STATUS_CODES.NO_CONTENT).json();
});

/**
 * Introspect endpoint to determine access token validity.
 */
export const introspect = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const request: IntrospectRequest = req.body;
  const verified = await validateAndGetAccessTokenPayloadAsync(request.token, false);

  res.status(HTTP_STATUS_CODES.OK).json({
    active: !!verified,
    client_id: verified.client_id,
    username: verified.email,
    exp: verified.exp
  })
});
