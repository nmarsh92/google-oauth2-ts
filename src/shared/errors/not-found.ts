import { HTTP_STATUS_CODES } from "../constants/http";
import { HttpError } from "./http-error";

/***
 *  404 No record found.
 */
export class NotFoundError extends HttpError {
  constructor(message = 'No record found.') {
    super(message, HTTP_STATUS_CODES.NOT_FOUND);
    this.name = 'NotFoundError';

  }

  /**
   *  Create an error with Id.
   * @param id - Id of record not found.
   * @returns {NotFoundError} 
   */
  static CreateWithId(id: string | number) {
    return new NotFoundError(`No record found for Id ${id}`);
  }
}