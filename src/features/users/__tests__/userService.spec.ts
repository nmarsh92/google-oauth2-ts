import { getOrCreateUser } from "../userService";
import { UserActivityModel } from "../domain/userActivity";
import { ArgumentNullError } from "../../../shared/errors/argument-null-error";
import { Activity } from "../domain/userActivity";
import { UserModel } from "../dataAccess/user";

jest.mock("../domain/user");
jest.mock("../domain/userActivity");

describe("userService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getOrCreateUser", () => {
    it("should throw an error if the payload is not provided", async () => {
      await expect(getOrCreateUser()).rejects.toThrow(ArgumentNullError);
    });

    it("should create a new user if one does not exist", async () => {
      const payload = {
        sub: "googleId",
        given_name: "John",
        family_name: "Doe",
        email: "johndoe@example.com",
        iss: "https://accounts.google.com",
        aud: "audience",
        iat: 123456789,
        exp: 123456789
      };

      jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(null);
      jest.spyOn(UserModel, "create").mockResolvedValueOnce(
        {
          id: "id",
          firstName: payload.given_name,
          lastName: payload.family_name,
          email: payload.email,
          providers: {
            googleId: payload.sub
          }
        } as never
      );


      const user = await getOrCreateUser(payload);

      expect(user.firstName).toBe(payload.given_name);
      expect(user.lastName).toBe(payload.family_name);
      expect(user.email).toBe(payload.email);
      expect(user.providers.googleId).toBe(payload.sub);

      expect(UserModel.findOne).toHaveBeenCalledWith({
        "providers.googleId": payload.sub
      });
      expect(UserModel.create).toHaveBeenCalledWith({
        firstName: payload.given_name,
        lastName: payload.family_name,
        email: payload.email,
        providers: {
          googleId: payload.sub
        }
      });
      expect(UserActivityModel.create).toHaveBeenCalledWith({
        type: Activity.SignUp,
        user: user
      });
    });

    it("should return an existing user if one exists", async () => {
      const payload = {
        sub: "googleId",
        given_name: "John",
        family_name: "Doe",
        email: "johndoe@example.com",
        iss: "https://accounts.google.com",
        aud: "audience",
        iat: 123456789,
        exp: 123456789
      };

      const existingUser = {
        id: "id",
        firstName: "Jane",
        lastName: "Doe",
        email: "janedoe@example.com",
        providers: {
          googleId: payload.sub
        }
      };

      jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(existingUser);


      const user = await getOrCreateUser(payload);

      expect(user).toBe(existingUser);

      expect(UserModel.findOne).toHaveBeenCalledWith({
        "providers.googleId": payload.sub
      });
      expect(UserModel.create).not.toHaveBeenCalled();
      expect(UserActivityModel.create).toHaveBeenCalledWith({
        type: Activity.Login,
        user: user
      });
    });
  });
});