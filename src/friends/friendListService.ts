import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { FriendList } from "./friendList";

export class FriendListService {
  private friendsListRepo: Collection<FriendList>;

  constructor(private _friendsListRepo: Collection<FriendList>) {
    this.friendsListRepo = _friendsListRepo;
  }

  /** Creates a new friends list into db.
   * To be used only when registering a new account.
   */
  public async registerFriendList(userID: ObjectID): Promise<void> {
    // Create a new instance of friend list.
    const friendList = new FriendList({
      _id: new ObjectID(),
      forID: userID,
      friendIDs: []
    });

    // Add it to the db.
    await this.friendsListRepo.insertOne(friendList);
  }

  // Adds a user into the friend list.
  public async addUserToFriendList(
    userID: ObjectID,
    friendID: ObjectID,
    res: express.Response
  ): Promise<void> {
    // Find user's friend list.
    let foundList = await this.friendsListRepo.findOne({
      forID: new ObjectID(userID)
    });

    // Update user's friend list.
    if (!foundList) {
      res.json({
        message: "There has been an error on our side."
      });
    } else {
      await this.friendsListRepo.updateOne(
        {
          forID: userID
        },
        {
          $addToSet: {
            friendIDs: friendID
          }
        }
      );
    }
  }

  // Removes a user from the friend list.
  public async removeUserFromFriendList(
    userID: ObjectID,
    friendID: ObjectID,
    res: express.Response
  ): Promise<void> {
    // Find user's friend list.
    let foundList = await this.friendsListRepo.findOne({
      forID: userID
    });

    if (!foundList) {
      res.json({
        message: "There has been an error on our side."
      });
    } else {
      // Update user's friend list.
      await this.friendsListRepo.updateOne(
        {
          forID: userID
        },
        {
          $pull: {
            friendIDs: friendID
          }
        }
      );
    }
  }

  // Fetch the friend list for a user.
  public async getFriendList(
    userID: ObjectID,
    res: express.Response
  ): Promise<FriendList> {
    let foundList = await this.friendsListRepo.findOne({
      forID: new ObjectID(userID)
    });

    if (!foundList) {
      res.status(404).json({
        message: "There has been an error on our side."
      });
    }

    return foundList;
  }
}
