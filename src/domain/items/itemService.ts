import { context } from "exceptional.js";
import { Collection, ObjectID } from "mongodb";

import { IItem } from "./IItem";
import { Item } from "./item";

import { ISharedItems } from "./ISharedItems";

const EXCEPTIONAL = context("default");

export class ItemService {
  private itemsRepo: Collection<IItem>;

  constructor(_ItemsRepo: Collection<IItem>) {
    this.itemsRepo = _ItemsRepo;
  }

  // Add an item.
  public async addItem(_item: Item): Promise<IItem> {
    // Create a new instance of the item class.
    const item = new Item(_item);

    // Add it to the collection.
    await this.itemsRepo.insertOne(item);

    return item;
  }

  // Delete an item.
  public async deleteItem(itemID: ObjectID): Promise<IItem> {
    // Find the item in the collection.
    const foundItem: Item = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID)
    });
    // Throw an error message if it doesn't exist.
    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "This item does not exist or it has already been deleted."
      });
    }
    // If it exists in the collection, remove it.
    await this.itemsRepo.deleteOne({
      _id: new ObjectID(itemID)
    });

    const deletedItem = new Item(foundItem);

    return deletedItem;
  }

  // Get items owned by a user.
  // Items that have not been bought yet.
  public async getPersonalItems(userID: ObjectID): Promise<IItem[]> {
    const items = await this.itemsRepo
      .find({ userID, isBought: false })
      .sort({ isShared: 1 })
      .toArray();

    return items;
  }

  // Get items for history tab.
  public async getHistoryItems(userID: ObjectID): Promise<IItem[]> {
    const items = await this.itemsRepo
      .find({ userID, isBought: true })
      .sort({ isShared: 1 })
      .toArray();

    return items;
  }

  // Get items shared by other users.
  public async getItemsSharedByOthers(
    userID: ObjectID
  ): Promise<ISharedItems[]> {
    // new array to store items for each user
    const sortedItems = [];
    // fetch items from db where 'userid' has access to
    const items = await this.itemsRepo
      .find({
        isBought: false,
        sharedWith: { $in: [userID] }
      })
      .sort({ userID: -1 })
      .toArray();

    // Good
    // create instances for each user and store them into sortedItems
    let id = new ObjectID();
    items.forEach(item => {
      if (id.toString() !== item.userID.toString()) {
        id = item.userID;
        sortedItems.push({
          userID: id,
          items: []
        });
      }
    });
    // fetch items for each user
    sortedItems.forEach(user => {
      items.forEach(item => {
        if (item.userID.toString() === user.userID.toString()) {
          user.items.push(item);
        }
      });
    });
    // return the newly created list
    return sortedItems;
  }

  // Edit an item.
  public async editItem(itemID: ObjectID, itemData: IItem): Promise<void> {
    // Find the item.
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID)
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item could not be found!"
      });
    }

    const item = new Item(itemData);

    await this.itemsRepo.updateOne(
      {
        _id: new ObjectID(item._id)
      },
      {
        $set: {
          name: itemData.name,
          quantity: itemData.quantity,
          isShared: itemData.isShared
        }
      }
    );
  }

  // Mark an item as bought.
  public async markAsBought(
    itemID: ObjectID,
    userID: ObjectID
  ): Promise<IItem> {
    // Find the item.
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID),
      $or: [
        { userID },
        {
          sharedWith: {
            $in: [userID]
          }
        }
      ]
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item could not be found!"
      });
    }

    let item = new Item(foundItem);
    item.markBought();

    await this.itemsRepo.updateOne(
      {
        _id: new ObjectID(item._id)
      },
      { $set: { isBought: item.isBought } }
    );

    return item;
  }

  // Set item's bought attribute as false.
  public async unmarkBought(
    itemID: ObjectID,
    userID: ObjectID
  ): Promise<IItem> {
    // Find item.
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID),
      $or: [
        { userID },
        {
          sharedWith: {
            $in: [userID]
          }
        }
      ]
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Item could not be found!"
      });
    }
    // Set isBought as false.
    let item = new Item(foundItem);
    item.unmarkBought();

    await this.itemsRepo.updateOne(
      {
        _id: new ObjectID(item._id)
      },
      { $set: { isBought: item.isBought } }
    );

    return item;
  }

  // Get an item by ID.
  public async getItemById(itemID: ObjectID): Promise<IItem> {
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID)
    });

    if (!foundItem) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "No item with this id in the database"
      });
    }

    return foundItem;
  }
}
