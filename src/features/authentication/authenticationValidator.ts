import { checkSchema } from "express-validator";
import { validate } from "../../shared/validator";

/**
 * Authentication validator.
 */
export const authenticationValidator = validate(checkSchema({
  "credential": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid credential.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid credential.",
      bail: true,
    },
    errorMessage: "Missing credential."
  },
  "clientId": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid clientId.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid clientId.",
      bail: true,
    },
  }
}))