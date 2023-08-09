import { UnauthorizedError } from "../errors/unauthorized";
import { NextFunction, Request, Response } from "express";
import { Environment } from "../environment";
import { ArgumentNullError } from "../errors/argument-null-error";
import BadRequestError from "../errors/bad-request";

export const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {

  try {
    const auth = req.headers.authorization;
    if (!auth) throw new UnauthorizedError();
    if (auth?.startsWith("Basic") && !interpretBasicAuth(auth)) throw new UnauthorizedError();
    next();
  } catch (error) {
    next(error)
  }

}

/**
 * 
 * @param basicAuth 
 * @returns 
 */
const interpretBasicAuth = (basicAuth?: string) => {
  if (!basicAuth) throw new ArgumentNullError("basicAuth");
  const credentials = basicAuth.split(" ");
  if (!credentials) throw new BadRequestError("Missing api key");
  if (credentials.length != 2) throw new BadRequestError("Invalid authorization header");
  if (credentials[0] !== "Basic") throw new BadRequestError("Invalid authorization header");

  const apiKey = credentials[1];
  if (!apiKey) throw new BadRequestError("Missing api key");

  const parts = Buffer.from(apiKey, "base64").toString("utf-8").split(":");
  if (parts.length != 2) throw new BadRequestError("Invalid api key");
  const clientId = parts[0];
  const secret = parts[1];
  if (!clientId || !secret) throw new BadRequestError("Invalid api key");

  return Environment.getInstance().getSecret(clientId) === secret;
}