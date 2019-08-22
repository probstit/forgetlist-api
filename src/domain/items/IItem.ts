import { ObjectID } from "mongodb";

export interface IItem {
  _id: ObjectID;
  userID: ObjectID;
  name: String;
  quantity: Number;
  isBought: boolean;
  isShared: boolean;
  sharedWith: ObjectID[];
}
