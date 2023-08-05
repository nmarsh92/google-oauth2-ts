import { HTTP_STATUS_CODES } from "../constants/http";
import { HttpError } from "./http-error";

/***
 *  401 unauthorized.
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'User is not authorized.') {
    super(message, HTTP_STATUS_CODES.UNAUTHORIZED);
    this.name = 'UnauthorizedError';
  }
}