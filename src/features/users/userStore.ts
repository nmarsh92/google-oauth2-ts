import { ArgumentNullError } from "../../shared/errors/argument-null-error";
import { NotFoundError } from "../../shared/errors/not-found";
import { UserModel } from "./dataAccess/user";
import { User } from "./domain/user";
import { UserDto } from "./dtos/userDto";

/**
 * Retrieves a user from the database based on their ID.
 * @param id The ID of the user to retrieve.
 * @returns A Promise that resolves to the user object, or null if the user is not found.
 */
export const getUserById = async function (id: string): Promise<User | null> {
  if (!id) throw new ArgumentNullError("id");
  const user = await UserModel.findById(id);
  return user;
}

/**
 * Creates a new user in the database.
 * @param user The user object to create.
 * @returns A Promise that resolves to the created user object.
 */
export const createUser = async function (user: UserDto): Promise<User> {
  if (!user) throw new ArgumentNullError("user");
  return await UserModel.create(user);
}

/**
 * Retrieves a user from the database based on their Google ID.
 * @param id The Google ID of the user to retrieve.
 * @returns A Promise that resolves to the user object, or null if the user is not found.
 */
export const getUserByGoogleId = async function (id: string): Promise<User | null> {
  if (!id) throw new ArgumentNullError("id");
  return await UserModel.findOne({ "providers.googleId": id });
}

/**
 * Ensures that a user with the specified ID exists in the database.
 * @param id The ID of the user to check.
 * @throws NotFoundError if the user is not found.
 */
export const ensureExists = async function (id: string): Promise<void> {
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError("User not found.");
}