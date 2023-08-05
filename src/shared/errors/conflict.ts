import { HTTP_STATUS_CODES } from "../constants/http";
import { HttpError } from "./http-error";

/***
 *  409 Conflict.
 */
export class ConflictError extends HttpError {
  constructor(message = 'Record was modified by another user.') {
    super(message, HTTP_STATUS_CODES.CONFLICT);
    this.name = 'ConflictError';

  }
}