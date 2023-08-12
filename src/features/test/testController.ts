import { HTTP_STATUS_CODES } from "../../shared/constants/http";
import { withErrorHandler } from "../../shared/controllerBase";
import { Request, Response, NextFunction } from "express";
import { validateAndGetAccessTokenPayloadAsync } from "../token/tokenService";
import { UnauthorizedError } from "../../shared/errors/unauthorized";

/**
 * Unprotected route.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object. 
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 * @throws {UnauthorizedError} Thrown if the access token is invalid.
 */
export const unprotected = withErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  res.status(HTTP_STATUS_CODES.OK).json({ message: "Unprotected route." });
});

/**
 * Protected route.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 * @throws {UnauthorizedError} Thrown if the access token is invalid.
 */
export const protectedRoute = withErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authorization = req.headers.authorization;
  const accessToken = authorization?.split(" ")[1];
  if (!accessToken) throw new UnauthorizedError("Missing access token.");
  await validateAndGetAccessTokenPayloadAsync(accessToken, false);
  res.status(HTTP_STATUS_CODES.OK).json({ message: "Protected route." });
});