import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES } from "../../shared/constants/http";
import { withErrorHandler } from "../../shared/controllerBase";
import BadRequestError from "../../shared/errors/bad-request";
import { UnauthorizedError } from "../../shared/errors/unauthorized";
import { validateAndGetAccessTokenPayloadAsync } from "../token/tokenService";

/**
 * Gets the user's information from the access token.
 */
export const getUserInfo = withErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) throw new UnauthorizedError();
  if (!req.query.clientId) throw new BadRequestError("Missing clientId.");
  const authorization = req.headers.authorization;
  const verified = await validateAndGetAccessTokenPayloadAsync(authorization, false);
  res.status(HTTP_STATUS_CODES.OK).json(verified);
});