import { HydratedDocument, Model } from "mongoose";
import { History } from "../models/history";

/**
* Creates a history item for the provided document.
* @param item - The document to create history for.
* @param historyClass - The history model class.
* @returns The created history item.
*/
export const createHistory = async <T, THistory extends History<T>>(item: HydratedDocument<T>, historyClass: Model<THistory>): Promise<THistory> => {
  const historyItem: THistory = {
    ...item.toObject(),
    expiredAt: Date.now(),
    parent: item._id,
    version: item.__v
  };
  const history = new historyClass(historyItem);

  await history.save();
  return history;
}