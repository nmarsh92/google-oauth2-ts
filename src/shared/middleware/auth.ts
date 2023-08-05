import { OAuth2Client } from "google-auth-library"
import { UnauthorizedError } from "../errors/unauthorized";
import { NextFunction, Request, Response } from "express";

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  const client = new OAuth2Client(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET);
  try {
    const csrfCookie = req.cookies["csrf_token"];
    const csrfHeader = req.headers['csrf_token'];
    if (!csrfCookie) throw new UnauthorizedError("Missing CSRF token.");
    if (!csrfHeader) throw new UnauthorizedError("Missing CSRF token.");
    if (csrfCookie !== csrfHeader) throw new UnauthorizedError("Invalid CSRF Token.");
    if (!req.headers.authorization) throw new UnauthorizedError();

    const ticket = await client.verifyIdToken({
      idToken: req.headers.authorization,
      audience: process.env.GOOGLE_OAUTH_CLIENT_ID,
    });


    const payload = ticket.getPayload();


    if (payload?.hd !== process.env.VERIFIED_DOMAIN)
      throw new UnauthorizedError();

    //todo: create or get
    //todo: generate access token


    next();
  } catch (error) {
    next(error)
  }

}