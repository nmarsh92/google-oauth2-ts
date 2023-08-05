import { HTTP_STATUS_CODES } from "../constants/http";
import { HttpError } from "./http-error";

/***
 *  500 internal server error.
 */
export class ServerError extends HttpError {
  constructor(message = 'Server ran into an issue.') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
    this.name = 'ServerError';
  }
}