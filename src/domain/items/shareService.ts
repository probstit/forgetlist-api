import { Collection, ObjectID } from "mongodb";

import { context } from "exceptional.js";
import { IItem } from "./IItem";
import { Item } from "./item";
import { FriendList } from "../friends/friendList";

const EXCEPTIONAL = context("default");

export class ShareService {
  private itemsRepo: Collection<IItem>;

  constructor(private _itemsRepo: Collection<IItem>) {
    this.itemsRepo = _itemsRepo;
  }

  /* Shares all the public items with a recently added friend.
   * Used when adding a new friend.
   */
  public async shareUserItems(
    userID: ObjectID,
    friendID: ObjectID
  ): Promise<void> {
    // Find users public items and share them with the friend.
    await this.itemsRepo.updateMany(
      { userID, isShared: true },
      {
        $addToSet: {
          sharedWith: friendID
        }
      }
    );
  }

  /* Hides all the items from a recently unfriended user.
   * Used when unfriending an user.
   */
  public async hideUserItems(
    userID: ObjectID,
    friendID: ObjectID
  ): Promise<void> {
    await this.itemsRepo.updateMany(
      {
        userID,
        sharedWith: { $in: [friendID] }
      },
      {
        $pull: {
          sharedWith: friendID
        }
      }
    );
  }

  // Share one item with one or more selected users (has to be friends).
  public async shareWithSome(
    itemID: ObjectID,
    friendID: ObjectID,
    userID: ObjectID
  ): Promise<void> {
    // Find the item.
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID),
      userID
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item could not be found."
      });
    }

    const item = new Item(foundItem);
    // Enable sharing if the item was previously set as private.
    if (!item.isShared) {
      item.enableSharing();

      await this.itemsRepo.updateOne(
        { _id: item._id },
        {
          $set: {
            isShared: item.isShared
          }
        }
      );
    }

    // Add friend's id on the item sharedWith list.
    await this.itemsRepo.updateOne(
      { _id: item._id },
      {
        $addToSet: {
          sharedWith: friendID
        }
      }
    );
  }

  // Hides an item from one or more specific users.
  public async hideItemFromSome(
    itemID: ObjectID,
    userID: ObjectID,
    friendID: ObjectID
  ): Promise<void> {
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID),
      userID
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item not found!"
      });
    } 

    await this.itemsRepo.updateOne(
      {
        _id: new ObjectID(itemID)
      },
      {
        $pull: {
          sharedWith: friendID
        }
      }
    );
  }

  /*
   * Enable sharing an item (making it public).
   * It will be shared with all the users from the friend list.
   */
  public async shareItem(
    itemID: ObjectID,
    userID: ObjectID,
    userFriendsList: FriendList
  ): Promise<void> {
    // Find the item.
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID),
      userID
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item could not be found!"
      });
    }

    const userFriends = [...userFriendsList.friendIDs];

    let item = new Item(foundItem);
    item.enableSharing();
    item.sharedWith = [...userFriends];

    await this.itemsRepo.updateOne(
      {
        _id: new ObjectID(item._id)
      },
      { $set: { isShared: item.isShared, sharedWith: item.sharedWith } }
    );
  }

  /* Set an item as private. [disable sharing]
   * This will hide the item from friends.
   */
  public async hideItem(
    itemID: ObjectID,
    userID: ObjectID
  ): Promise<ObjectID[]> {
    // Find the item.
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID),
      userID
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item was not found!"
      });
    }

    let item = new Item(foundItem);
    item.disableSharing();
    // Remove friend access to this item.
    let removedAccess = item.sharedWith.splice(0, item.sharedWith.length);

    // Update details in the db.
    await this.itemsRepo.updateOne(
      {
        _id: new ObjectID(item._id)
      },
      {
        $set: {
          isShared: item.isShared,
          sharedWith: item.sharedWith
        }
      }
    );

    return removedAccess;
  }

  /* This will set all the private items as public.
   * Friends will be able to see these items afterwards.
   */
  public async allowSharingForAll(
    userID: ObjectID,
    userFriendsList: FriendList
  ): Promise<void> {
    const userFriends = [...userFriendsList.friendIDs];
    await this.itemsRepo.updateMany(
      { userID, isShared: false },
      { $set: { isShared: true, sharedWith: userFriends } }
    );
  }

  /* This will share all the items, private or public
   * with everyone in the friend list.
   */
  public async shareListWithAllFriends(
    userID: ObjectID,
    userFriendsList: FriendList
  ): Promise<void> {
    const userFriends = [...userFriendsList.friendIDs];
    await this.itemsRepo.updateMany(
      { userID },
      { $set: { isShared: true, sharedWith: userFriends } }
    );
  }
  /* Hides all items from all the users.
   * Items will be set as private.
   */
  public async hideList(userID: ObjectID): Promise<void> {
    await this.itemsRepo.updateMany(
      { userID, isShared: true },
      { $set: { isShared: false, sharedWith: [] } }
    );
  }
}
