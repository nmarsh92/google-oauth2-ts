import { HTTP_STATUS_CODES } from "../constants/http";
/**
 * @class HttpError
 * @classdesc An error with an http status code.
 * @augments Error
 */
export class HttpError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}