import { ServerError } from "./server-error";

/***
 *  500 internal server error.
 */
export class ArgumentNullError extends ServerError {
  constructor(propertyName = 'Argument') {
    super(`${propertyName} cannot be null.`);
    this.name = 'ArgumentNullError';
  }
}