import { ArgumentNullError } from "../../shared/errors/argument-null-error";
import bcrypt from "bcrypt";
import { RefreshTokenModel, RefreshToken } from "./models/refreshToken";
import { HydratedDocument } from "mongoose";
import { NotFoundError } from "../../shared/errors/not-found";
import { v4 as uuidv4 } from 'uuid';
import jwt, { SignOptions } from "jsonwebtoken";
import { RefreshTokenPayload } from "./tokenPayload";
import { Environment } from "../../shared/environment";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { ensureExists, getUserById } from "../users/userStore";
const saltRounds = 10;
const expiresIn = 864000;
/**
 * Adds a new refresh token to the database or retrieves an existing one.
 *
 * @param {string} userId - The ID of the user for whom the refresh token is associated.
 * @param {string} clientId - Client Id.
 * @returns {Promise<string>} - The newly generated token key if a new refresh token is created.
 * @throws {ArgumentNullError} - When `userId` is empty or not provided.
 * @throws {NotFoundError} - When `create` is false and the refresh token doesn't exist.
 */
export const addAndGetRefreshToken = async (userId?: string, clientId?: string): Promise<string> => {
  if (!userId) throw new ArgumentNullError('id');
  if (!clientId) throw new ArgumentNullError('clientId');
  const env = Environment.getInstance();
  const tokenKey = uuidv4();
  const user = await getUserById(userId);
  if (!user) throw new NotFoundError("User not found");


  const refreshPayload: RefreshTokenPayload = {
    key: tokenKey,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
  }
  const hash = await hashToken(tokenKey);

  const refreshToken = await RefreshTokenModel.create({
    userId: userId,
    hashedTokenIdentifier: hash,
    expiredAt: new Date(Date.now() + expiresIn)
  });


  await refreshToken.save();
  return jwt.sign(refreshPayload, env.getSecret(clientId), { expiresIn, subject: userId, audience: env.audience, issuer: env.issuer });
}

/**
 * Invalidates a specific refresh token for a user.
 *
 * @param {string} userId - The ID of the user associated with the refresh token.
 * @param {string} tokenKey - The token key to be invalidated.
 * @throws {ArgumentNullError} - When `userId` or `tokenKey` is empty or not provided.
 */
export const invalidateRefreshToken = async (userId: string, tokenKey: string) => {
  if (!userId) throw new ArgumentNullError('id');
  if (!tokenKey) throw new ArgumentNullError('tokenId');
  await ensureExists(userId);
  const token = await getRefreshToken(userId, tokenKey);
  token.expiredAt = new Date(Date.now() + (1000 * 60));
  token.save();
}

/**
 * Validates the refresh token for the given user.
 * @param {string} userId - The ID of the user for whom to validate the refresh token.
 * @param {string} tokenKey - The token key to be validated.
 * @returns {Promise<void>} A Promise that resolves when the validation is successful.
 * @throws {ArgumentNullError} If the `userId` or `tokenKey` parameters are null or empty.
 * @throws {NotFoundError} If the user is not found.
 * @throws {UnauthorizedError} If the refresh token is invalid.
 */
export const validateRefreshToken = async (userId?: string, tokenKey?: string): Promise<void> => {
  if (!userId) throw new ArgumentNullError('id');
  if (!tokenKey) throw new ArgumentNullError('tokenId');
  await ensureExists(userId);

  // Get the refresh token document for the user
  const token = await getRefreshToken(userId, tokenKey);


  if (!token)
    throw new UnauthorizedError("Invalid refresh token.");
};


/**
 * Gets the refresh token for a specific user.
 *
 * @param {string} userId - The ID of the user for whom to retrieve the refresh token.
 * @returns {Promise<HydratedDocument<IRefreshTokenStore>>} - The retrieved refresh token document.
 * @throws {ArgumentNullError} - When `userId` is empty or not provided.
 * @throws {NotFoundError} - When the refresh token for the user is not found.
 */
const getRefreshToken = async (userId: string, tokenKey: string): Promise<HydratedDocument<RefreshToken>> => {
  if (!userId) throw new ArgumentNullError('userId');
  if (!tokenKey) throw new ArgumentNullError("tokenKey");
  const hash = await hashToken(tokenKey);
  const token = await RefreshTokenModel.findOne({ userId: userId, hashedTokenIdentifier: hash });
  if (!token) throw new NotFoundError("No refresh tokens found.");
  return token;
}

/**
 * Generates a hash for the provided token identifier using bcrypt.
 *
 * @param {string} tokenIdentifier - The token identifier to be hashed.
 * @returns {Promise<string>} - The hashed token identifier.
 * @throws {ArgumentNullError} - When `tokenIdentifier` is empty or not provided.
 */
const hashToken = async (tokenIdentifier: string): Promise<string> => {
  if (!tokenIdentifier) throw new ArgumentNullError("TokenIdentifer");
  return await bcrypt.hash(tokenIdentifier, saltRounds);
}