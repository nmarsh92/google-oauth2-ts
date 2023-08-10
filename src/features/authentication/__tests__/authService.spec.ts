import { loginWithGoogle } from "../authService";
import { OAuth2Client } from "google-auth-library";
import { TokenResponse } from "../../token/api/tokenResponse";
import { UnauthorizedError } from "../../../shared/errors/unauthorized";
import { Environment } from "../../../shared/environment";
import * as userService from "../../users/userService";
import * as tokenService from "../../token/tokenService";
import * as dotenv from 'dotenv';

dotenv.config();

describe("authService", () => {
  jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
    getPayload: () => ({
      email_verified: true,
      hd: "test"
    })
  } as never);

  jest.spyOn(userService, "getOrCreateUser").mockResolvedValue({
    id: "test",
    email: "test",
    firstName: "test",
    lastName: "test",
    providers: {
      googleId: "test"
    },
    createdAt: new Date(),
    updatedAt: new Date()
  } as never);

  jest.spyOn(tokenService, "signAndGetAccessTokenAsync").mockResolvedValue("test");
  jest.spyOn(tokenService, "addAndGetRefreshTokenAsync").mockResolvedValue("test");

  beforeEach(() => {
    jest.clearAllMocks();
    const instance = Environment.getInstance();
    instance.clients["test"] = "test";
    instance.verifiedDomains.push("test");
  });

  test("loginWithGoogle", async () => {
    const { access_token, refresh_token } = await loginWithGoogle("test", "test");
    expect(access_token).toBe("test");
    expect(refresh_token).toBe("test");
  });

  test("loginWithGoogle with invalid domain", async () => {
    jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
      getPayload: () => ({
        email_verified: true,
        hd: "yellow.com"
      })
    } as never);

    expect(async () => await loginWithGoogle("test", "test")).rejects.toThrowError(UnauthorizedError);
  });

  test("loginWithGoogle with invalid email", async () => {
    jest.spyOn(OAuth2Client.prototype, "verifyIdToken").mockResolvedValue({
      getPayload: () => ({
        email_verified: false,
        hd: "test"
      })
    } as never);

    expect(async () => await loginWithGoogle("test", "test")).rejects.toThrowError(UnauthorizedError);
  });
});