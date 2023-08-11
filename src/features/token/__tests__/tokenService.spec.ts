import { Environment } from "../../../shared/environment";
import { signAndGetAccessTokenAsync, validateAndGetAccessTokenPayloadAsync, validateAndGetRefreshTokenPayloadAsync, addAndGetRefreshTokenAsync, hashToken, invalidateRefreshToken, invalidateAllRefreshTokens } from "../tokenService";
import * as userService from "../../users/userService";
import * as userStore from "../../users/userStore";
import * as tokenStore from "../tokenStore";
import * as dotenv from 'dotenv';
import { User } from "../../users/domain/user";
import { RefreshToken } from "../domain/refreshToken";
import bcrypt from "bcrypt";
dotenv.config();
describe("Token Service", () => {
  let mockUser: User;
  let mockRefreshToken: RefreshToken;
  beforeAll(() => {
    const instance = Environment.getInstance();
    instance.clients["test"] = "test";

  });

  beforeEach(async () => {
    const refreshTokenHash = await hashToken("test");
    mockUser = {
      id: "test",
      email: "test",
      firstName: "test",
      lastName: "test",
      providers: {
        googleId: "test"
      },
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;

    mockRefreshToken = {
      id: "test",
      hashedTokenIdentifier: refreshTokenHash,
      expiredAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      usedAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId: mockUser.id,
      isDeleted: false
    } as unknown as RefreshToken;


    jest.spyOn(userService, "getUserById").mockResolvedValue(mockUser);
    jest.spyOn(userStore, "ensureExists").mockResolvedValue();
    jest.spyOn(tokenStore, "addRefreshToken").mockResolvedValue();
    jest.spyOn(tokenStore, "validateRefreshToken").mockResolvedValue();
    jest.spyOn(tokenStore, "invalidateRefreshTokenStore").mockResolvedValue();
    jest.spyOn(tokenStore, "invalidateAllRefreshTokensStore").mockResolvedValue();
  });

  test("signAndGetAccessTokenAsync returns a token", async () => {
    const clientId = "test";
    const sub = "test";
    const token = await signAndGetAccessTokenAsync(clientId, sub);
    expect(token).toBeDefined();
  });

  test("validateAndGetAccessTokenPayloadAsync", async () => {
    const clientId = "test";
    const sub = "test";
    const token = await signAndGetAccessTokenAsync(clientId, sub);
    const decoded = await validateAndGetAccessTokenPayloadAsync(token, true, clientId);

    expect(decoded).toBeDefined();
    expect(decoded.client_id).toBe(clientId);
    expect(decoded.sub).toBe(sub);
    expect(decoded.email).toBe(mockUser.email);
    expect(decoded.firstName).toBe(mockUser.firstName);
    expect(decoded.lastName).toBe(mockUser.lastName);
    expect(decoded.exp).toBeDefined();
  });

  test("validateAndGetAccessTokenPayloadAsync with invalid token", async () => {
    const clientId = "test";
    const sub = "test";
    const invalidClientId = "invalid";
    const token = await signAndGetAccessTokenAsync(clientId, sub);

    expect(async () => { await validateAndGetAccessTokenPayloadAsync(token, true, invalidClientId) }).rejects.toThrowError("Invalid access token.");
  });

  test("validateAndGetAccessTokenPayloadAsync with invalid token", async () => {
    Environment.getInstance().clients["invalid"] = "invalid";
    const clientId = "test";
    const sub = "test";
    const invalidClientId = "invalid";
    const token = await signAndGetAccessTokenAsync(clientId, sub);

    expect(async () => { await validateAndGetAccessTokenPayloadAsync(token, true, invalidClientId) }).rejects.toThrowError("Invalid access token.");
  });

  test("addAndGetRefreshTokenAsync to return a string", async () => {
    const clientId = "test";
    const token = await addAndGetRefreshTokenAsync(mockUser.id, clientId);
    expect(token).toBeDefined();
  });

  test("validateAndGetRefreshTokenPayloadAsync to validate and decode", async () => {
    const clientId = "test";
    const sub = "test";
    const token = await addAndGetRefreshTokenAsync(mockUser.id, sub);
    const decoded = await validateAndGetRefreshTokenPayloadAsync(token);

    expect(decoded).toBeDefined();
    expect(decoded.client_id).toBe(clientId);
    expect(decoded.sub).toBe(sub);
    expect(decoded.key).toBeDefined();
    expect(decoded.exp).toBeDefined();
    expect(decoded.firstName).toBe(mockUser.firstName);
    expect(decoded.lastName).toBe(mockUser.lastName);
    expect(decoded.email).toBe(mockUser.email);
  });

  test("validateAndGetRefreshTokenPayloadAsync with invalid token", async () => {
    const clientId = "test";

    const token = await addAndGetRefreshTokenAsync(mockUser.id, clientId);

    expect(async () => { await validateAndGetRefreshTokenPayloadAsync(token + "invalid") }).rejects.toThrowError("Invalid refresh token.");
  });

  test("hashToken to return a string", async () => {
    const token = "test";
    const hashedToken = await hashToken(token);
    expect(hashedToken).toBeDefined();
  });

  test("hashToken is different for different tokens", async () => {
    const token1 = "test1";
    const token2 = "test2";
    const hashedToken1 = await hashToken(token1);
    const hashedToken2 = await hashToken(token2);
    expect(hashedToken1).not.toBe(hashedToken2);
    expect(bcrypt.compareSync(token1, hashedToken1)).toBe(true);
    expect(bcrypt.compareSync(token2, hashedToken2)).toBe(true);
    expect(bcrypt.compareSync(token1, hashedToken2)).toBe(false);
    expect(bcrypt.compareSync(token2, hashedToken1)).toBe(false);
  });

  test("invalidateRefreshToken to call tokenStore", async () => {
    const tokenKey = "test";
    await invalidateRefreshToken(mockUser.id, tokenKey);
    expect(tokenStore.invalidateRefreshTokenStore).toBeCalledWith(mockUser.id, tokenKey);
  });

  test("invalidateAllRefreshTokens to call tokenStore", async () => {

    await invalidateAllRefreshTokens(mockUser.id);
    expect(tokenStore.invalidateAllRefreshTokensStore).toBeCalledWith(mockUser.id);
  });
});
