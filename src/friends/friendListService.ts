import { Collection, ObjectID } from "mongodb";
import { context } from "exceptional.js";

import { FriendList } from "./friendList";
import { Item } from "../items/item";
import { ShareService } from "../items/shareService";

const EXCEPTIONAL = context("default");

export class FriendListService {
  private friendsListRepo: Collection<FriendList>;
  private itemsRepo: Collection<Item>;

  constructor(
    private _friendsListRepo: Collection<FriendList>,
    private _itemsRepo: Collection<Item>
  ) {
    this.friendsListRepo = _friendsListRepo;
    this.itemsRepo = _itemsRepo;
  }

  /** Creates a new friends list into db.
   * To be used only when registering a new account.
   */
  public async registerFriendList(userID: ObjectID): Promise<void> {
    // Create a new instance of friend list.
    const friendList = new FriendList({
      _id: new ObjectID(),
      userID: userID,
      friendIDs: []
    });

    // Add it to the db.
    await this.friendsListRepo.insertOne(friendList);
  }

  // Adds a user into the friend list.
  public async addUserToFriendList(
    userID: ObjectID,
    friendID: ObjectID
  ): Promise<void> {
    // Find user's friend list.
    let foundList = await this.friendsListRepo.findOne({
      userID: new ObjectID(userID)
    });

    // Update user's friend list.
    if (!foundList) {
      // Throw error if the user is not found.
      throw EXCEPTIONAL.GenericException(0, {
        message: "Something went wrong on our side. Plase contact support team."
      });
    } else {
      // Add the friend into the user's friend list.
      await this.friendsListRepo.updateOne(
        {
          userID
        },
        {
          $addToSet: {
            friendIDs: friendID
          }
        }
      );

      const shareService = new ShareService(this.itemsRepo);
      shareService.shareUserItems(userID, friendID);
    }
  }

  // Removes a user from the friend list.
  public async removeUserFromFriendList(
    userID: ObjectID,
    friendID: ObjectID
  ): Promise<void> {
    // Find user's friend list.
    let foundList = await this.friendsListRepo.findOne({
      userID: userID
    });

    if (!foundList) {
      throw EXCEPTIONAL.GenericException(0, {
        message: "Something went wrong on our side. Plase contact support team."
      });
    } else {
      // Update user's friend list.
      await this.friendsListRepo.updateOne(
        {
          userID
        },
        {
          $pull: {
            friendIDs: friendID
          }
        }
      );
      
      const shareService = new ShareService(this.itemsRepo);
      await shareService.hideUserItems(userID, friendID);
    }
  }

  // Fetch the friend list for a user.
  public async getFriendList(userID: ObjectID): Promise<FriendList> {
    let foundList = await this.friendsListRepo.findOne({
      userID: new ObjectID(userID)
    });

    if (!foundList) {
      throw EXCEPTIONAL.GenericException(0, {
        message: "Something went wrong on our side. Plase contact support team."
      });
    }

    return foundList;
  }
}
