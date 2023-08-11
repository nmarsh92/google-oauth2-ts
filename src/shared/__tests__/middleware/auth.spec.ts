import { isAuthorized } from "../../middleware/auth";
import { UnauthorizedError } from "../../errors/unauthorized";
import { Environment } from "../../environment";
import * as dotenv from 'dotenv';

dotenv.config();

describe("isAuthorized", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    jest.resetAllMocks();
    jest.spyOn(Environment.getInstance(), "getSecret").mockReturnValue("password");
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it("should call next if the authorization header is present and valid", async () => {
    req.headers.authorization = "Basic dGVzdDpwYXNzd29yZA=="; // "test:password" in base64

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should throw an UnauthorizedError if the authorization header is missing", async () => {
    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });

  it("should throw a UnauthorizedError if the authorization header is not a valid Basic auth header", async () => {
    req.headers.authorization = "Bearer token";

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });

  it("should throw a UnauthorizedError if the api key is missing", async () => {
    req.headers.authorization = "Basic ";

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });

  it("should throw a UnauthorizedError if the api key is not a valid base64 string", async () => {
    req.headers.authorization = "Basic not-base64";

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });

  it("should throw a UnauthorizedError if the api key is not in the correct format", async () => {
    req.headers.authorization = "Basic dGVzdDpwYXNzd29yZG9t"; // "test:passworddom" in base64

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });

  it("should throw a UnauthorizedError if the client ID or secret is missing", async () => {
    req.headers.authorization = "Basic dGVzdDoxMjM="; // "test:123" in base64

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });

  it("should throw a UnauthorizedError if the client ID or secret is incorrect", async () => {
    req.headers.authorization = "Basic dGVzdDpwYXNzd29yZA=="; // "test:password" in base64

    const mockGetSecret = jest.fn().mockReturnValue("incorrect-secret");
    jest.spyOn(Environment.getInstance(), "getSecret").mockImplementation(mockGetSecret);

    await isAuthorized(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or invalid credential."));
  });
});