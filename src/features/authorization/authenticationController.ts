import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { getOrCreateUser } from "../users/userService";
import jwt from "jsonwebtoken";
import { withErrorHandler } from "../../shared/controllerBase";
import { OAuth2Client } from "google-auth-library";
import { Environment } from "../../shared/environment";
import { TokenPayload } from "../token/api/tokenPayload";
import { addAndGetRefreshToken, signAndGetAccessTokenAsync } from "../token/tokenService";
import BadRequestError from "../../shared/errors/bad-request";
import { validateAndGetAccessTokenPayloadAsync } from "../token/tokenService";
import { HTTP_STATUS_CODES } from "../../shared/constants/http";
import { AuthenticationRequest } from "../api/authenticationRequest";


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
  const environment = Environment.getInstance();
  const request: AuthenticationRequest = req.body; //todo validation


  // Verify Google OAuth token
  const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET);
  const ticket = await client.verifyIdToken({
    idToken: request.credential,
    audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
  });
  const user = await getOrCreateUser(ticket.getPayload());

  const access_token = await signAndGetAccessTokenAsync(request.clientId, user.id, environment.audiences);
  const refresh_token = await addAndGetRefreshToken(user.id, request.clientId); // Expires in 10 days
  res.status(HTTP_STATUS_CODES.OK).json({ access_token, refresh_token });
});


export const getUserInfo = withErrorHandler(async (req: Request, res: Response) => {
  if (!req.headers.authorization) throw new UnauthorizedError();
  if (!req.query.clientId) throw new BadRequestError("Missing clientId.");
  const authorization = req.headers.authorization;
  const verified = validateAndGetAccessTokenPayloadAsync(authorization, false);
  res.status(HTTP_STATUS_CODES.OK).json({
    sub: verified.payload.sub,
    email: verified.payload.email,
    firstName: verified.payload.firstName,
    lastName: verified.payload.lastName
  });
});
