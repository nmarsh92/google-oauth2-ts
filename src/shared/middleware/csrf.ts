import { NextFunction, Request, Response } from "express";
import { UnauthorizedError } from "../errors/unauthorized";

export const checkCsrf = async (req: Request, res: Response, next: NextFunction) => {
  const csrfCookie = req.cookies["csrf_token"];
  const csrfHeader = req.headers['csrf_token'];
  if (csrfCookie !== csrfHeader || !csrfCookie || !csrfHeader) {
    next(new UnauthorizedError("Missing or Invalid CSRF Token."))
    return;
  }
  next();
}