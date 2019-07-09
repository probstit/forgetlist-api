import { ObjectID } from "mongodb";

export class FriendList {
  _id: ObjectID;
  userID: ObjectID;
  friendIDs: ObjectID[];

  constructor(data: FriendList) {
    this._id = data._id;
    this.userID = data.userID;
    this.friendIDs = data.friendIDs;
  }
}
