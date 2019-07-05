import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { Item } from "../items/item";
import { ItemService } from "../items/itemService";
import { FriendList } from "../friends/friendList";
import { FriendListService } from "../friends/friendListService";

export function itemRoutes(
  itemsRepo: Collection<Item>,
  friendsRepo: Collection<FriendList>
): express.Router {
  const router = express.Router();
  const itemService: ItemService = new ItemService(itemsRepo);
  const friendListService: FriendListService = new FriendListService(
    friendsRepo,
    itemsRepo
  );

  // Route for adding an item.
  router.post(
    "/items/add-item",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        // Create a new instance of Item class.
        let newItem = new Item({
          _id: new ObjectID(),
          userID: (req as any).user._id,
          name: req.body.name,
          quantity: req.body.quantity,
          isBought: false,
          isShared: req.body.isShared,
          sharedWith: []
        });
        /*
         * Check if the user wants to share the item.
         * If so, then add user's friends on the sharedWith list.
         */
        if (newItem.isShared) {
          const usersFriendList = await friendListService.getFriendList(
            newItem.userID
          );
          const userFriends = [...usersFriendList.friendIDs];
          newItem.sharedWith = [...userFriends];
        }
        // Push the new item into the db.
        const addedItem = await itemService.addItem(newItem);

        res.json({
          message: "Successfully added item.",
          addedItem
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for deleting and item.
  router.delete(
    "/items/delete-item/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const deletedItem: Item = await itemService.deleteItem(req.params.id);

        res.status(200).json({
          message: "Item has been successfully removed.",
          deletedItem
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for getting the items for a user.
  router.get(
    "/items/get-items",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;

        let userItems = await itemService.getItems(userID);

        res.json({
          items: userItems
        });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
