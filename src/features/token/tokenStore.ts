import { ArgumentNullError } from "../../shared/errors/argument-null-error";
import { RefreshTokenModel, RefreshToken } from "./models/refreshToken";
import { HydratedDocument } from "mongoose";
import { NotFoundError } from "../../shared/errors/not-found";
import { UnauthorizedError } from "../../shared/errors/unauthorized";

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
export const addRefreshToken = async (userId: string, expiredAt: Date, tokenHash: string): Promise<void> => {
  if (!userId) throw new ArgumentNullError('id');
  if (!expiredAt) throw new ArgumentNullError('clientId');
  if (!tokenHash) throw new ArgumentNullError("tokenHash")
  const refreshToken = await RefreshTokenModel.create({
    userId: userId,
    hashedTokenIdentifier: tokenHash,
    expiredAt: new Date(Date.now() + expiresIn)
  });

  await refreshToken.save();
}

/**
 * Invalidates a specific refresh token for a user.
 *
 * @param {string} userId - The ID of the user associated with the refresh token.
 * @param {string} tokenHash - The token key to be invalidated.
 * @throws {ArgumentNullError} - When `userId` or `tokenKey` is empty or not provided.
 */
export const invalidateRefreshTokenStore = async (userId: string, tokenHash: string) => {
  if (!userId) throw new ArgumentNullError('id');
  if (!tokenHash) throw new ArgumentNullError('tokenId');
  const token = await getRefreshToken(userId, tokenHash);
  token.expiredAt = new Date(Date.now() + (1000 * 60));
  token.save();
}

/**
 * Validates the refresh token for the given user.
 * @param {string} userId - The ID of the user for whom to validate the refresh token.
 * @param {string} tokenHash - The token key to be validated.
 * @returns {Promise<void>} A Promise that resolves when the validation is successful.
 * @throws {ArgumentNullError} If the `userId` or `tokenKey` parameters are null or empty.
 * @throws {NotFoundError} If the user is not found.
 * @throws {UnauthorizedError} If the refresh token is invalid.
 */
export const validateRefreshToken = async (userId?: string, tokenHash?: string): Promise<void> => {
  if (!userId) throw new ArgumentNullError('id');
  if (!tokenHash) throw new ArgumentNullError('tokenId');
  // Get the refresh token document for the user
  const token = await getRefreshToken(userId, tokenHash);

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
export const getRefreshToken = async (userId: string, tokenHash: string): Promise<HydratedDocument<RefreshToken>> => {
  if (!userId) throw new ArgumentNullError('userId');
  if (!tokenHash) throw new ArgumentNullError("tokenKey");
  const token = await RefreshTokenModel.findOne({ userId: userId, hashedTokenIdentifier: tokenHash });
  if (!token) throw new NotFoundError("No refresh tokens found.");
  return token;
}