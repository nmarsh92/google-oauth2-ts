import { Request, Response, NextFunction } from 'express';

export type ControllerMethod = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;

export const withErrorHandler = (controllerMethod: ControllerMethod) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await controllerMethod(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};