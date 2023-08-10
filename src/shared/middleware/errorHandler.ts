import { Request, Response, NextFunction } from 'express';
import { HttpError } from "../errors/http-error";
import BadRequestError from "../errors/bad-request";
import { logger } from '../logger';
/**
 * Error handling middleware for HttpErrors.
 * @param {Error} error 
 * @param {Request} _ 
 * @param {Request} res 
 * @param {NextFunction} next 
 * @returns 
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (error: Error, _: Request, res: Response, next: NextFunction) => {
  logger.error(error);

  if (error instanceof BadRequestError) {
    res.status(error.statusCode).json({ ...error });
    return;
  }

  if (error instanceof HttpError) {
    res.status(error.statusCode).json({ ...error, message: error.message });
    return;
  }

  res.status(500).json({ ...error, message: error.message })
}