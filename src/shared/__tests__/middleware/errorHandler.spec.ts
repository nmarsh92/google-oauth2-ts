import { Request, Response, NextFunction } from "express";
import { errorHandler } from "../../middleware/errorHandler";
import { HttpError } from "../../errors/http-error";
import BadRequestError from "../../errors/bad-request";
import { logger } from "../../logger";

jest.mock("../../logger");

describe("errorHandler", () => {
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    req = {} as Request;
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    } as unknown as Response;
    next = jest.fn();
  });

  it("should log the error", () => {
    const error = new Error("test error");

    errorHandler(error, req, res, next);

    expect(logger.error).toHaveBeenCalledWith(error);
  });

  it("should return a BadRequestError if the error is a BadRequestError", () => {
    const error = new BadRequestError("test error");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(error.statusCode);
    expect(res.json).toHaveBeenCalledWith({ ...error });
  });

  it("should return an HttpError if the error is an HttpError", () => {
    const error = new HttpError("test error", 404);

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(error.statusCode);
    expect(res.json).toHaveBeenCalledWith({ ...error, message: error.message });
  });

  it("should return a 500 error if the error is not a BadRequestError or HttpError", () => {
    const error = new Error("test error");

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ ...error, message: error.message });
  });
});