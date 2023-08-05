import { validationResult, ValidationChain } from 'express-validator';
import { RequestHandler } from 'express';
import BadRequestError from './errors/bad-request';

/**
 * Validate request based on provided rules.
 * @param validations Validation chain
 * @returns 
 */
export const validate = (validations: ValidationChain[]): RequestHandler => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    return next(new BadRequestError("Validation errors.", errors.array()))
  };
};