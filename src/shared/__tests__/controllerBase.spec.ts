import { Request, Response, NextFunction } from "express";
import { withErrorHandler, ControllerMethod } from "../controllerBase";

describe("withErrorHandler", () => {
  let controllerMethod: ControllerMethod;
  let req: Request;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    controllerMethod = jest.fn();
    req = {} as Request;
    res = {} as Response;
    next = jest.fn();
  });

  it("should call the controller method with the correct arguments", async () => {
    await withErrorHandler(controllerMethod)(req, res, next);

    expect(controllerMethod).toHaveBeenCalledWith(req, res, next);
  });

  it("should call the next function with the error if the controller method throws an error", async () => {
    const error = new Error("test error");
    (controllerMethod as jest.Mock).mockRejectedValueOnce(error);

    await withErrorHandler(controllerMethod)(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

});