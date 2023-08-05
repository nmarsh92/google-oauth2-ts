import { HTTP_STATUS_CODES } from "../constants/http";
import { HttpError } from "./http-error";
import { ValidationError } from "express-validator"

/***
 *  400 Bad request.
 */
export class BadRequestError extends HttpError {
  errors?: ValidationError[];
  constructor(message = 'Bad request.', validationErrors?: ValidationError[]) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST);
    this.name = 'BadRequestError';
    this.errors = validationErrors;
  }
}

export default BadRequestError;