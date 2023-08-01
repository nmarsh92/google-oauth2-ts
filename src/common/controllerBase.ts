import { Request, Response, NextFunction } from 'express';

/**
 * The type definition for a controller method.
 * @typedef {function} ControllerMethod
 * @param {Request} req - The Express Request object.
 * @param {Response} res - The Express Response object.
 * @param {NextFunction} next - The Express NextFunction middleware.
 * @returns {Promise<unknown>} A promise that resolves to the controller method result.
 */
export type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

/**
 * Wraps a controller method with error handling middleware.
 *
 * @param {ControllerMethod} controllerMethod - The controller method to wrap.
 * @returns {function} An Express middleware function that handles errors from the controller method.
 */
export const withErrorHandler = (controllerMethod: ControllerMethod) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controllerMethod(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};