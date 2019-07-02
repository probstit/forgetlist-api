import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { Item } from "./item";

export class ItemService {
  private itemsRepo: Collection<Item>;

  constructor(_ItemsRepo: Collection<Item>) {
    this.itemsRepo = _ItemsRepo;
  }

  // Add an item.
  public async addItem(_item: Item): Promise<Item> {
    // Create a new instance of the item class.
    const item = new Item(_item);
    // Add it to the collection.
    await this.itemsRepo.insertOne(item);

    return item;
  }

  // Delete an item.
  public async deleteItem(
    itemID: ObjectID,
    res: express.Response
  ): Promise<Item> {
    // Find the item in the collection.
    const foundItem: Item = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID)
    });
    // Throw an error message if it doesn't exist.
    if (!foundItem) {
      res.status(404).json({
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

  // Get items for a user.
  public async getItems(userID: ObjectID) {
    const items = await this.itemsRepo.find({ userID }).toArray();

    return items;
  }

  // Get an item by ID.
  public async getItemById(itemID: ObjectID): Promise<Item> {
    let foundItem = await this.itemsRepo.findOne({
      _id: new ObjectID(itemID)
    });

    return foundItem;
  }
}
