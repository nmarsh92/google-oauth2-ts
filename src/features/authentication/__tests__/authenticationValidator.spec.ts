import { Request, Response, NextFunction } from "express";
import BadRequestError from "../../../shared/errors/bad-request";
import { authenticationValidator } from "../authenticationValidator";

describe("authenticationValidator", () => {
  it("should call the next middleware function if the token is valid", async () => {
    const req = { body: { credential: "valid-credential", clientId: "valid" } } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    await authenticationValidator(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return a 400 Bad Request response if the token is missing or invalid", async () => {
    const req = { body: { credential: "", clientId: "" } } as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;
    await authenticationValidator(req, res, next);
    expect(next).toHaveBeenCalledWith(new BadRequestError("Validation errors."));
  });
});