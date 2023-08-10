import { tokenRequestValidator, invalidateRequestValidator } from "../tokenValidator";
import { Request, Response, NextFunction } from "express";
import BadRequestError from "../../../shared/errors/bad-request";

describe("tokenValidator", () => {
  it("should call the next middleware function if the token is valid", async () => {
    const req = { body: { token: "valid-token" } } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    await tokenRequestValidator(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return a 400 Bad Request response if the token is missing or invalid", async () => {
    const req = { body: { token: "" } } as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;
    await tokenRequestValidator(req, res, next);
    expect(next).toHaveBeenCalledWith(new BadRequestError("Validation errors."));
  });
});

describe("invalidateRequestValidator", () => {
  it("should call the next middleware function if the refresh_token and client_id are valid", async () => {
    const req = { body: { refresh_token: "valid-refresh-token", client_id: "valid-client-id" } } as Request;
    const res = {} as Response;
    const next = jest.fn() as NextFunction;
    await invalidateRequestValidator(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("should return a 400 Bad Request response if the refresh_token or client_id is missing or invalid", async () => {
    const req = { body: { refresh_token: "", client_id: "" } } as Request;
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() } as unknown as Response;
    const next = jest.fn() as NextFunction;
    await invalidateRequestValidator(req, res, next);
    expect(next).toHaveBeenCalledWith(new BadRequestError("Validation errors."));
  });
});