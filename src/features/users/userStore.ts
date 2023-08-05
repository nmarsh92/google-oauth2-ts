import { NotFoundError } from "../../shared/errors/not-found";
import { User, UserModel } from "./models/user";


export const getUserById = async function (id: string): Promise<User | null> {
  const user = await UserModel.findById(id);
  console.log(id);
  console.log(user);
  return user;
}
export const createUser = async function (user: User): Promise<User | null> {
  return await UserModel.create(user);
}
export const getUserByGoogleId = async function (id: string): Promise<User | null> {
  return await UserModel.findOne({ "providers.googleId": id });
}
export const ensureExists = async function (id: string): Promise<void> {
  const user = await UserModel.findById(id);
  if (!user) throw new NotFoundError("User not found.");
}
