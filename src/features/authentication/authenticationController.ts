import { NextFunction, Request, Response } from "express";
import { withErrorHandler } from "../../shared/controllerBase";
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
  const request: AuthenticationRequest = req.body;
  const response = await loginWithGoogle(request.credential, request.clientId);
  res.status(HTTP_STATUS_CODES.OK).json(response);
});
