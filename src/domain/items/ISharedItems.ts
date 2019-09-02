import { IItem } from "./IItem";
import { ObjectID } from "mongodb";

export interface ISharedItems {
  userID: ObjectID;
  items: IItem[];
}
