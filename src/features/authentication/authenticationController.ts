import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { getOrCreateUser } from "../users/userService";
import { withErrorHandler } from "../../shared/controllerBase";
import { OAuth2Client } from "google-auth-library";
import { Environment } from "../../shared/environment";
import { addAndGetRefreshToken, signAndGetAccessTokenAsync } from "../token/tokenService";
import BadRequestError from "../../shared/errors/bad-request";
import { validateAndGetAccessTokenPayloadAsync } from "../token/tokenService";
import { HTTP_STATUS_CODES } from "../../shared/constants/http";
import { AuthenticationRequest } from "./api/authenticationRequest";
import { loginWithGoogle } from "./authService";

/**
 * Handles the Google OAuth authentication flow.
 * This function verifies the user's Google credentials and generates a code
 * to be used for token exchange on the server.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 */
export const authenticateWithGoogle = withErrorHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  // todo CSRF token validation
  const request: AuthenticationRequest = req.body; //todo validation
  const response = await loginWithGoogle(request.credential, request.clientId);
  res.status(HTTP_STATUS_CODES.OK).json(response);
});


export const getUserInfo = withErrorHandler(async (req: Request, res: Response) => {
  if (!req.headers.authorization) throw new UnauthorizedError();
  if (!req.query.clientId) throw new BadRequestError("Missing clientId.");
  const authorization = req.headers.authorization;
  const verified = await validateAndGetAccessTokenPayloadAsync(authorization, false);
  res.status(HTTP_STATUS_CODES.OK).json(verified);
});
