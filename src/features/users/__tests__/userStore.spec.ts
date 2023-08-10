import { getUserById, createUser, getUserByGoogleId, ensureExists } from "../userStore";
import { NotFoundError } from "../../../shared/errors/not-found";
import { UserModel } from "../dataAccess/user";

describe("userStore", () => {
  describe("getUserById", () => {
    it("should call UserModel.findById with the correct id", async () => {
      const id = "123";
      const user = { _id: id, name: "John Doe" };

      const findByIdSpy = jest.spyOn(UserModel, "findById").mockResolvedValueOnce(user);

      const result = await getUserById(id);

      expect(findByIdSpy).toHaveBeenCalledWith(id);
      expect(result).toEqual(user);

      findByIdSpy.mockRestore();
    });

    it("should return null if the user is not found", async () => {
      const id = "123";

      const findByIdSpy = jest.spyOn(UserModel, "findById").mockResolvedValueOnce(null);

      const result = await getUserById(id);

      expect(findByIdSpy).toHaveBeenCalledWith(id);
      expect(result).toBeNull();

      findByIdSpy.mockRestore();
    });
  });

  describe("createUser", () => {
    it("should call UserModel.create with the correct user object", async () => {
      const user = {
        id: "",
        firstName: "John",
        lastName: "Doe",
        email: "email@email.com",
        providers: {
          googleId: "123"
        },
        phone: "1234567890"

      };

      const createSpy = jest.spyOn(UserModel, "create").mockResolvedValueOnce(user as never);

      const result = await createUser(user);

      expect(createSpy).toHaveBeenCalledWith(user);
      expect(result).toEqual(user);

      createSpy.mockRestore();
    });
  });

  describe("getUserByGoogleId", () => {
    it("should call UserModel.findOne with the correct googleId", async () => {
      const googleId = "123";
      const user = { _id: "456", name: "John Doe" };

      const findOneSpy = jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(user);

      const result = await getUserByGoogleId(googleId);

      expect(findOneSpy).toHaveBeenCalledWith({ "providers.googleId": googleId });
      expect(result).toEqual(user);

      findOneSpy.mockRestore();
    });

    it("should return null if the user is not found", async () => {
      const googleId = "123";

      const findOneSpy = jest.spyOn(UserModel, "findOne").mockResolvedValueOnce(null);

      const result = await getUserByGoogleId(googleId);

      expect(findOneSpy).toHaveBeenCalledWith({ "providers.googleId": googleId });
      expect(result).toBeNull();

      findOneSpy.mockRestore();
    });
  });

  describe("ensureExists", () => {
    it("should throw a NotFoundError if the user is not found", async () => {
      const id = "123";

      const findByIdSpy = jest.spyOn(UserModel, "findById").mockResolvedValueOnce(null);

      await expect(ensureExists(id)).rejects.toThrow(NotFoundError);

      expect(findByIdSpy).toHaveBeenCalledWith(id);

      findByIdSpy.mockRestore();
    });

    it("should not throw an error if the user exists", async () => {
      const id = "123";
      const user = { _id: id, name: "John Doe" };

      const findByIdSpy = jest.spyOn(UserModel, "findById").mockResolvedValueOnce(user);

      await expect(ensureExists(id)).resolves.not.toThrow();

      expect(findByIdSpy).toHaveBeenCalledWith(id);

      findByIdSpy.mockRestore();
    });
  });
});