import { Collection, ObjectID } from "mongodb";

import { Item } from "./item";

export class ShareService {
  private itemsRepo: Collection<Item>;

  constructor(private _itemsRepo: Collection<Item>) {
    this.itemsRepo = _itemsRepo;
  }

  // Shares all the public items with a recently added friend.
  public async shareUserItems(userID: ObjectID, friendID: ObjectID) {
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

  // Hides all the items from a recently unfriended user.
  public async hideUserItems(userID: ObjectID, friendID: ObjectID) {
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
}
