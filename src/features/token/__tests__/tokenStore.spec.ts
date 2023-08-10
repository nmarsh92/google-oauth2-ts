import * as tokenStore from "../tokenStore";
import { hashToken } from "../tokenService";
import bcrypt from "bcrypt";
import { RefreshTokenModel } from "../dataAccess/refreshToken";

describe("tokenStore", () => {
  const expiredAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const token = {
    id: "test",
    expiredAt: expiredAt,
    usedAttempts: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    userId: "test",
    isDeleted: false,
    hashedTokenIdentifier: ""
  }

  beforeEach(async () => {
    jest.resetAllMocks();
    token.hashedTokenIdentifier = await hashToken("test");
    jest.spyOn(RefreshTokenModel, "find").mockResolvedValue([
      token
    ]);
  });

  test("getRefreshToken", async () => {
    const myToken = await tokenStore.getRefreshToken("test", "test");
    expect(myToken).toBeDefined();
    expect(bcrypt.compareSync("test", myToken.hashedTokenIdentifier)).toBe(true);
    expect(myToken.expiredAt).toBe(expiredAt);
    expect(myToken.usedAttempts).toBe(0);
    expect(myToken.userId).toBe("test");
    expect(myToken.isDeleted).toBe(false);
    expect(myToken.createdAt).toBeDefined();
    expect(myToken.updatedAt).toBeDefined();
    expect(bcrypt.compareSync("test1", myToken.hashedTokenIdentifier)).toBe(false);
  });

  test("validateRefreshToken", async () => {
    await tokenStore.validateRefreshToken("test", "test");
    expect(RefreshTokenModel.find).toBeCalledTimes(1);
    expect(RefreshTokenModel.find).toBeCalledWith({ userId: "test" });
  });

  //todo fix this test
  // test("validateRefreshToken with invalid token", () => {
  //   // jest.spyOn(tokenStore, "getRefreshToken").mockResolvedValue(
  //   //   token as unknown as HydratedDocument<RefreshToken>
  //   // );
  //   expect(async () => { await tokenStore.validateRefreshToken("test", "test") }).rejects.toThrowError();
  // });
});