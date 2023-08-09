import jwt, { SignOptions } from "jsonwebtoken";
import { Environment } from "../../shared/environment";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { addRefreshToken, invalidateRefreshTokenStore, validateRefreshToken as validateRefreshTokenStore } from "./tokenStore";
import { RefreshTokenPayload, TokenPayload } from "./api/tokenPayload";
import { getUserById } from "../users/userService";
import { ensureExists } from "../users/userStore";
import { ArgumentNullError } from "../../shared/errors/argument-null-error";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from "bcrypt";

const refreshTokenExpiresIn = 864000; // 10 days
const accessTokenExpiration = 1800; // 30 minutes
const saltRounds = 10;
const invalidMessage = "Invalid access token.";
/**
 * Validates and retrieves the payload from the provided access token.
 *
 * @param {string} accessToken - The access token to validate and retrieve the payload from.
 * @param {boolean} clientIdRequired - Indicates whether the clientId is required for validation.
 * @param {string} clientId - The clientId associated with the access token, if required.
 * @returns {JwtPayload} The payload from the valid access token.
 * @throws {UnauthorizedError} If the access token is missing, invalid, or validation fails.
 */
export const validateAndGetAccessTokenPayloadAsync = (accessToken: string, clientIdRequired: boolean, clientId?: string): TokenPayload => {
  if (!accessToken) throw new UnauthorizedError("Access token is required.");
  if (clientIdRequired && !clientId) throw new UnauthorizedError("Client id required.");
  const environment = Environment.getInstance();
  const decoded = jwt.decode(accessToken, { complete: true }) as { payload: TokenPayload } | null;
  if (!decoded || !decoded.payload) throw new UnauthorizedError(invalidMessage);

  let verified: TokenPayload | null = null;
  const { payload } = decoded;

  if (clientId) {
    try {
      // If clientId is provided, verify the token with the specific client secret
      verified = <TokenPayload>jwt.verify(accessToken, environment.getSecret(clientId), {
        subject: payload.sub,
        audience: environment.audiences,
        issuer: environment.issuer,
      });
    } catch {
      throw new UnauthorizedError(invalidMessage);
    }


    if (!verified) throw new UnauthorizedError(invalidMessage);
  } else {
    if (!payload.client_id) throw new UnauthorizedError(invalidMessage);
    // If clientId is not provided, just verify the token without specific client secret

    try {
      verified = <TokenPayload>jwt.verify(accessToken, environment.getSecret(payload.client_id), {
        subject: payload.sub,
        audience: environment.audiences,
        issuer: environment.issuer
      });
    } catch {
      throw new UnauthorizedError(invalidMessage);
    }
  }
  if (!verified) throw new UnauthorizedError(invalidMessage);
  return verified;
};


/**
 *  Sign a new access token for given user.
 * @param clientId - ClientId
 * @param userId - UserId
 * @param audience - Audience
 * @returns 
 */
export const signAndGetAccessTokenAsync = async (clientId: string, userId: string): Promise<string> => {
  const environment = Environment.getInstance();
  const secret = environment.getSecret(clientId);

  const user = await getUserById(userId);
  const options: SignOptions = {
    expiresIn: accessTokenExpiration,
    audience: environment.audiences,
    subject: userId,
    issuer: environment.issuer
  }
  const tokenPayload: TokenPayload = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    client_id: clientId
  }
  return jwt.sign(tokenPayload, secret, options);
}

/**
 * Validates and retrieves the payload from the provided refresh token.
 *
 * @param {string} refreshToken - The refresh token to validate and retrieve the payload from.
 * @returns {Promise<JwtPayload>} The payload from the valid refresh token.
 * @throws {UnauthorizedError} If the refresh token is missing, invalid, or validation fails.
 */
export const validateAndGetRefreshTokenPayloadAsync = async (refreshToken: string): Promise<TokenPayload> => {
  if (!refreshToken) throw new UnauthorizedError("RefreshToken required.");
  const environment = Environment.getInstance();
  const decoded = jwt.decode(refreshToken, { complete: true }) as { payload: TokenPayload } | null;
  if (!decoded || !decoded.payload || !decoded.payload.sub) throw new UnauthorizedError("Invalid refresh token.");
  const { payload } = decoded;
  try {
    const verified = <TokenPayload>jwt.verify(refreshToken, environment.getSecret(payload.client_id), {
      subject: payload.sub,
      audience: environment.audiences,
      issuer: environment.issuer,
    });
    if (!verified) throw new UnauthorizedError(invalidMessage);
    await validateRefreshTokenStore(verified.sub, verified.key);
    return verified;
  } catch {
    throw new UnauthorizedError("Invalid refresh token.")
  }
}

/**
 *  Add and return new refresh token.
 * @param userId 
 * @param clientId 
 * @returns 
 */
export const addAndGetRefreshTokenAsync = async (userId: string, clientId: string): Promise<string> => {
  if (!userId) throw new ArgumentNullError('id');
  if (!clientId) throw new ArgumentNullError('clientId');
  const env = Environment.getInstance();
  const tokenKey = uuidv4();
  const user = await getUserById(userId);
  const options: SignOptions = { expiresIn: refreshTokenExpiresIn, subject: userId, audience: env.audiences, issuer: env.issuer };
  const refreshPayload: RefreshTokenPayload = {
    key: tokenKey,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    client_id: clientId
  }
  const hash = await hashToken(tokenKey);

  await addRefreshToken(userId, new Date(Date.now() + refreshTokenExpiresIn), hash);

  return jwt.sign(refreshPayload, env.getSecret(clientId), options);
}

/**
 *  Invalidate a refresh token.
 * @param userId 
 * @param tokenKey 
 */
export const invalidateRefreshToken = async (userId: string, tokenKey: string) => {
  if (!userId) throw new ArgumentNullError('id');
  if (!tokenKey) throw new ArgumentNullError('tokenId');
  await ensureExists(userId);
  await invalidateRefreshTokenStore(userId, tokenKey);
}


/**
 * Generates a hash for the provided token identifier using bcrypt.
 *
 * @param {string} tokenIdentifier - The token identifier to be hashed.
 * @returns {Promise<string>} - The hashed token identifier.
 * @throws {ArgumentNullError} - When `tokenIdentifier` is empty or not provided.
 */
export const hashToken = async (tokenIdentifier: string): Promise<string> => {
  if (!tokenIdentifier) throw new ArgumentNullError("TokenIdentifer");
  return await bcrypt.hash(tokenIdentifier, saltRounds);
}