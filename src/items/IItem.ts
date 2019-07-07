import { ObjectID } from "mongodb";

export interface IItem {
  _id: ObjectID;
  userID: ObjectID;
  name: String;
  quantity: Number;
  isBought: Boolean;
  isShared: Boolean;
  sharedWith: ObjectID[];
}
