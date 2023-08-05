import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { getOrCreateUser, getUserById } from "../users/userService";
import jws from "jws";
import jwt from "jsonwebtoken";
import { withErrorHandler } from "../../shared/controllerBase";
import { OAuth2Client } from "google-auth-library";
import { Environment } from "../../shared/environment";
import { TokenPayload } from "../token/tokenPayload";
import { addAndGetRefreshToken, invalidateRefreshToken } from "../token/tokenStore";
import BadRequestError from "../../shared/errors/bad-request";
import { validateAndGetAccessToken, validateAndGetRefreshToken } from "../token/tokenService";
import { HS256 } from "../../shared/constants/encrpytion";
import { AUTH_REDIRECT_URI, INVALID_LOGIN_URI, LOGGED_IN_URI } from "../../shared/constants/api";
import { HTTP_STATUS_CODES } from "../../shared/constants/http";


/**
 * Handles the Google OAuth authentication flow.
 * This function verifies the user's Google credentials and generates a code
 * to be used for token exchange on the server.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction.
 * @returns {Promise<void>} A Promise that resolves when the operation is completed.
 */
export const authenticateWithGoogle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // CSRF token validation
    const environment = Environment.getInstance();
    const csrfCookie = req.cookies["g_csrf_token"];
    const csrfHeader = req.body['g_csrf_token'];
    const clientId: string = req.body.clientId;
    const state: string = req.body.state;
    const code_challenge = req.query.code_challenge?.toString();
    let code_challenge_method = req.query.code_challenge_method?.toString();
    if (csrfCookie !== csrfHeader || !csrfCookie || !csrfHeader) {
      throw new UnauthorizedError("Missing or Invalid CSRF Token.");
    }
    if (!code_challenge) {
      //https://datatracker.ietf.org/doc/html/rfc7636#section-4.4.1 
      res.redirect(`${INVALID_LOGIN_URI}?error=invalid_request&error_description=${encodeURIComponent("code challnge required.")}`,);
      return;
    }
    if (!code_challenge_method) {
      code_challenge_method = "plain";
    }

    if (code_challenge_method != "plain" && code_challenge_method != "S256") {
      //https://datatracker.ietf.org/doc/html/rfc7636#section-4.4.1 
      res.redirect(`${INVALID_LOGIN_URI}?error=error_uri&error_description=${encodeURIComponent("transform algorithm not supported.")}`,);
      return;
    }
    // Verify Google OAuth token
    const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET);
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });

    //todo
    const user = await getOrCreateUser(ticket.getPayload());

    // Generate a code (JWT token) to be exchanged for access and refresh tokens
    const code = jws.sign({
      header: { alg: HS256 },
      payload: {
        sub: user._id,
        redirect_uri: `${environment.issuer}${AUTH_REDIRECT_URI}`,
        clientId: clientId,
        exp: Date.now() + (1000 * 30), // Expiration time of the code (30 seconds)
        iat: Date.now(),
        code_challenge, //https://datatracker.ietf.org/doc/html/rfc7636#section-4.4 
        code_challenge_method
      },
      secret: environment.clients[clientId],
    });

    // Redirect to the client-side page with the code
    res.redirect(`${LOGGED_IN_URI}?code=${code}&state=${state}`);
  } catch (error) {
    console.error(error);
    res.redirect(INVALID_LOGIN_URI);
  }
};
/**
 * Handles the token exchange flow after the Google OAuth authentication.
 * This function takes the generated code from the client-side and returns
 * access and refresh tokens to the client.
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @returns {void}
 * @throws {UnauthorizedError} If the code is missing or invalid.
 * @throws {ServerError} If the secret or client ID is missing.
 * @throws {UnauthorizedError} If the code verification fails or if the code has expired.
 */
export const authorize = withErrorHandler(async (req: Request, res: Response): Promise<void> => {
  const environment = Environment.getInstance();
  const code = req.query.code?.toString();
  const clientId: string = req.body.clientId;
  const code_verifier: string = req.body.code_verifier?.toString();
  if (!code) throw new UnauthorizedError();
  if (!clientId) throw new UnauthorizedError();
  if (!code_verifier) throw new UnauthorizedError(); //https://datatracker.ietf.org/doc/html/rfc7636#section-4.5

  const clientSecret = environment.clients[clientId];
  // Verify the code using the client's secret
  const verified = jws.verify(code.toString(), HS256, environment.clients[clientId]);
  if (!verified) throw new UnauthorizedError();

  const decoded = jws.decode(code, { json: true });
  const userId: string = decoded.payload.sub;
  // Check if the code has expired
  if (!decoded.payload.exp || decoded.payload.exp <= Date.now()) {
    throw new UnauthorizedError("Code has expired.");
  }

  const user = await getUserById(userId);
  // Generate and return the access and refresh tokens
  const payload: TokenPayload = { email: user.email, firstName: user.firstName, lastName: user.lastName };
  const access_token = jwt.sign(payload, clientSecret, { expiresIn: 1800, subject: userId, audience: environment.audience, issuer: environment.issuer }); // Expires in 30 minutes
  const refresh_token = await addAndGetRefreshToken(userId, clientId); // Expires in 10 days
  res.status(HTTP_STATUS_CODES.OK).json({ access_token, refresh_token });
});

export const getUserInfo = withErrorHandler(async (req: Request, res: Response) => {
  if (!req.headers.authorization) throw new UnauthorizedError();
  if (!req.query.clientId) throw new BadRequestError("Missing clientId.");
  const authorization = req.headers.authorization;
  const verified = validateAndGetAccessToken(authorization, false);
  res.status(HTTP_STATUS_CODES.OK).json({
    sub: verified.payload.sub,
    email: verified.payload.email,
    firstName: verified.payload.firstName,
    lastName: verified.payload.lastName
  });
});

export const token = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  const environment = Environment.getInstance();
  const refreshToken = req.cookies["refresh_token"];
  const clientId: string = req.body.clientId;
  const secret = environment.getSecret(clientId);
  if (!refreshToken) throw new UnauthorizedError()
  const decoded = await validateAndGetRefreshToken(refreshToken);
  const { payload } = decoded;
  if (!payload.key || !decoded.payload.sub) throw new UnauthorizedError();

  const access_token = jwt.sign({ sub: payload.sub }, secret, { expiresIn: 1800, audience: payload.aud, subject: payload.sub });
  await invalidateRefreshToken(payload.sub, refreshToken.key);
  const refresh_token = await addAndGetRefreshToken(payload.sub, clientId);

  res.status(HTTP_STATUS_CODES.CREATED).json({ access_token, refresh_token });
});

export const invalidate = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {

  const refreshToken = req.cookies["refresh_token"];
  if (!refreshToken) {
    throw new UnauthorizedError("Refresh token not provided.");
  }
  const decoded = await validateAndGetRefreshToken(refreshToken);
  if (!decoded.sub) throw new UnauthorizedError();

  await invalidateRefreshToken(decoded.sub, decoded.key);

  res.status(HTTP_STATUS_CODES.NO_CONTENT).json();
});