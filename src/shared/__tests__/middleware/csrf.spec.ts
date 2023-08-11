import { checkCsrf } from "../../middleware/csrf";
import { UnauthorizedError } from "../../errors/unauthorized";

describe("checkCsrf", () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = {
      cookies: {},
      headers: {},
    };
    res = {};
    next = jest.fn();
  });

  it("should call next if the CSRF token is present and valid", async () => {
    req.cookies.csrf_token = "valid-token";
    req.headers.csrf_token = "valid-token";

    await checkCsrf(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should throw an UnauthorizedError if the CSRF token is missing from the cookie", async () => {
    req.headers.csrf_token = "valid-token";

    await checkCsrf(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or Invalid CSRF Token."));
  });

  it("should throw an UnauthorizedError if the CSRF token is missing from the header", async () => {
    req.cookies.csrf_token = "valid-token";

    await checkCsrf(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or Invalid CSRF Token."));
  });

  it("should throw an UnauthorizedError if the CSRF token is invalid", async () => {
    req.cookies.csrf_token = "invalid-token";
    req.headers.csrf_token = "valid-token";

    await checkCsrf(req, res, next);

    expect(next).toHaveBeenCalledWith(new UnauthorizedError("Missing or Invalid CSRF Token."));
  });
});