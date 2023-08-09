import { HTTP_STATUS_CODES } from "../constants/http";

/**
 * Type representing valid HTTP status codes.
 */
type ValidHttpStatus = typeof HTTP_STATUS_CODES[keyof typeof HTTP_STATUS_CODES];
/**
 * @class HttpError
 * @classdesc An error with an http status code.
 * @augments Error
 */
export class HttpError extends Error {
  statusCode: ValidHttpStatus;

  constructor(message: string, statusCode: ValidHttpStatus = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}