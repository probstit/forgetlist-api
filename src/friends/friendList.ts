import { ObjectID } from "mongodb";

export class FriendList {
  _id: ObjectID;
  forID: ObjectID;
  friendIDs: ObjectID[];

  constructor(data: FriendList) {
    this._id = data._id;
    this.forID = data.forID;
    this.friendIDs = data.friendIDs;
  }
}
