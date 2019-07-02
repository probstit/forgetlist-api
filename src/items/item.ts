import { ObjectID } from "mongodb";

export class Item {
  _id: ObjectID;
  userID: ObjectID;
  name: String;
  quantity: Number;
  isBought: Boolean;
  isShared: Boolean;
  sharedWith: ObjectID[];

  constructor(data: Item) {
    this._id = data._id;
    this.userID = data.userID;
    this.name = data.name;
    this.quantity = data.quantity;
    this.isBought = data.isBought;
    this.isShared = data.isShared;
    this.sharedWith = data.sharedWith;
  }
}