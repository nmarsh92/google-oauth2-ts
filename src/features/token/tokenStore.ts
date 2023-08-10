import { ArgumentNullError } from "../../shared/errors/argument-null-error";
import { RefreshToken } from "./domain/refreshToken";
import { HydratedDocument } from "mongoose";
import { NotFoundError } from "../../shared/errors/not-found";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import bcrypt from "bcrypt";
import { RefreshTokenModel } from "./dataAccess/refreshToken";
/**
 * Adds a new refresh token to the database or retrieves an existing one.
 *
 * @param {string} userId - The ID of the user for whom the refresh token is associated.
 * @param {string} clientId - Client Id.
 * @returns {Promise<string>} - The newly generated token key if a new refresh token is created.
 * @throws {ArgumentNullError} - When `userId` is empty or not provided.
 * @throws {NotFoundError} - When `create` is false and the refresh token doesn't exist.
 */
export const addRefreshToken = async (userId: string, expiredAt: number, tokenHash: string): Promise<void> => {
  if (!userId) throw new ArgumentNullError('id');
  if (!expiredAt) throw new ArgumentNullError('clientId');
  if (!tokenHash) throw new ArgumentNullError("tokenHash")
  const refreshToken = await RefreshTokenModel.create({
    userId: userId,
    hashedTokenIdentifier: tokenHash,
    expiredAt
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
export const invalidateRefreshTokenStore = async (userId: string, tokenKey: string) => {
  if (!userId) throw new ArgumentNullError('id');
  if (!tokenKey) throw new ArgumentNullError('tokenId');
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
  if (!tokenKey) throw new ArgumentNullError('tokenKey');

  // Get the refresh token document for the user
  const token = await getRefreshToken(userId, tokenKey);

  if (!token)
    throw new UnauthorizedError("Invalid refresh token.");

  if (token.expiredAt.getTime() < Date.now()) {
    console.log(token.expiredAt.getTime() < Date.now())
    throw new UnauthorizedError("Invalid refresh token.")
  }

};

/**
 * Gets the refresh token for a specific user.
 *
 * @param {string} userId - The ID of the user for whom to retrieve the refresh token.
 * @returns {Promise<HydratedDocument<IRefreshTokenStore>>} - The retrieved refresh token document.
 * @throws {ArgumentNullError} - When `userId` is empty or not provided.
 * @throws {NotFoundError} - When the refresh token for the user is not found.
 */
export const getRefreshToken = async (userId: string, tokenKey: string): Promise<HydratedDocument<RefreshToken>> => {
  if (!userId) throw new ArgumentNullError('userId');
  if (!tokenKey) throw new ArgumentNullError("tokenKey");
  const tokens = await RefreshTokenModel.find({ userId: userId });
  const token = tokens.find(tkn => {
    return bcrypt.compareSync(tokenKey, tkn.hashedTokenIdentifier);
  });

  if (!token) throw new NotFoundError("No refresh tokens found.");
  return token;
}