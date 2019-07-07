import { ObjectID } from "mongodb";
import { IItem } from "./IItem";

export class Item implements IItem {
  _id: ObjectID;
  userID: ObjectID;
  name: String;
  quantity: Number;
  isBought: Boolean;
  isShared: Boolean;
  sharedWith: ObjectID[];

  constructor(data: IItem) {
    this._id = data._id;
    this.userID = data.userID;
    this.name = data.name;
    this.quantity = data.quantity;
    this.isBought = data.isBought;
    this.isShared = data.isShared;
    this.sharedWith = data.sharedWith;
  }

  public enableSharing(): void {
    this.isShared = true;
  }

  public disableSharing(): void {
    this.isShared = false;
  }

  public markBought(): void {
    this.isBought = true;
  }

  public unmarkBought(): void {
    this.isBought = false;
  }
}
