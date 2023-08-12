import { UnauthorizedError } from "../errors/unauthorized";
import { NextFunction, Request, Response } from "express";
import { Environment } from "../environment";
import { ArgumentNullError } from "../errors/argument-null-error";

const error = new UnauthorizedError("Missing or invalid credential.");

/**
 * Client credentials middleware.
 * @param req 
 * @param res 
 * @param next 
 */
export const isAuthorizedBasic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) throw error;
    if (!auth?.startsWith("Basic") || !interpretBasicAuth(auth)) throw error;
    next();
  } catch (error) {
    next(error)
  }

}

/**
 * Bearer token middleware.
 * @param req 
 * @param res 
 * @param next 
 */
export const isAuthorizedBearer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth) throw error;
    if (!auth?.startsWith("Bearer") || !interpretBearerAuth(auth)) throw error;
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
  if (!credentials) throw error;
  if (credentials.length != 2) throw error;
  if (credentials[0] !== "Basic") throw error;

  const apiKey = credentials[1];
  if (!apiKey) throw error;

  const parts = Buffer.from(apiKey, "base64").toString("utf-8").split(":");
  if (parts.length != 2) throw error;
  const clientId = parts[0];
  const secret = parts[1];
  if (!clientId || !secret) throw error;

  return Environment.getInstance().getSecret(clientId) === secret;
}

/**
 * Interprets the bearer token.
 * @param bearerAuth 
 * @returns 
 */
const interpretBearerAuth = (bearerAuth?: string) => {
  if (!bearerAuth) throw new ArgumentNullError("bearerAuth");

  const credentials = bearerAuth.split(" ");
  if (!credentials) throw error;
  if (credentials.length != 2) throw error;
  if (credentials[0] !== "Bearer") throw error;

  const token = credentials[1];
  if (!token) throw error;

  return token;
}