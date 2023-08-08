import { checkSchema } from "express-validator";
import { validate } from "../../shared/validator";

/**
 * Token request validator.
 */
export const tokenRequestValidator = validate(checkSchema({
  "grant_type": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid grant_type.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid grant_type.",
      bail: true,
    },
    contains: {
      options: ["refresh_token"],
      errorMessage: "Missing or invalid grant_type.",
      bail: true,
    },
    errorMessage: "Missing grant_type."
  },
  "refresh_token": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid refresh_token.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid refresh_token.",
      bail: true,
    },
    errorMessage: "Missing refresh_token."
  },
  "client_id": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid client_id.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid client_id.",
      bail: true,
    },
    errorMessage: "Missing client_id."
  }
}));

/**
 * Introspect request validator.
 */
export const introspectRequestValidator = validate(checkSchema({
  "token": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid token.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid token.",
      bail: true,
    },
    errorMessage: "Missing token."
  }
}));

/**
 * Invalidate request validator.
 */
export const invalidateRequestValidator = validate(checkSchema({
  "refresh_token": {

    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid refresh_token.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid refresh_token.",
      bail: true,
    },
    errorMessage: "Missing refresh_token."
  },
  "client_id": {
    in: ["body"],
    isString: {
      errorMessage: "Missing or invalid client_id.",
      bail: true,
    },
    notEmpty: {
      errorMessage: "Missing or invalid client_id.",
      bail: true,
    },
    errorMessage: "Missing client_id."
  }
}));