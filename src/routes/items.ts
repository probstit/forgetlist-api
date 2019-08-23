import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { Item } from "../domain/items/item";
import { IItem } from "../domain/items/IItem";
import { ItemService } from "../domain/items/itemService";
import { FriendList } from "../domain/friends/friendList";
import { FriendListService } from "../domain/friends/friendListService";

export function itemRoutes(
  itemsRepo: Collection<IItem>,
  friendsRepo: Collection<FriendList>
): express.Router {
  const router = express.Router();
  const itemService: ItemService = new ItemService(itemsRepo);
  const friendListService: FriendListService = new FriendListService(
    friendsRepo
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
          const userFriendList = await friendListService.getFriendList(
            newItem.userID
          );
          const userFriends = [...userFriendList.friendIDs];
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
        const deletedItem: IItem = await itemService.deleteItem(req.params.id);

        res.status(200).json({
          message: "Item has been successfully removed.",
          deletedItem
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for getting the items owned by a user.
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

        let userItems = await itemService.getPersonalItems(userID);
        userItems.forEach(item => {
          delete item.userID;
          delete item.sharedWith;
        });
        res.json({
          items: userItems
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for fetching all the items shared by other users.
  router.get(
    "/items/shared-by-others",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        let sharedByOthers = await itemService.getItemsSharedByOthers(userID);

        res.json({
          items: sharedByOthers
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for editing an item.
  router.put(
    "items/edit-item/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const itemID = req.params.id;
        await itemService.editItem(itemID);

        res.json({
          message: "Item successfully edited."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for marking an item as bought.
  router.put(
    "/items/mark-bought/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userID = (req as any).user._id;
        const boughtItem = await itemService.markAsBought(
          req.params.id,
          userID
        );

        res.json({
          message: "Successfully bought item",
          boughtItem,
          boughtBy: userID
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for unmarking an item as bought.
  router.put(
    "/items/unmark-bought/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userID = (req as any).user._id;
        const unmarkedItem = await itemService.unmarkBought(
          req.params.id,
          userID
        );

        res.json({
          message: "Unmarked item",
          unmarkedItem,
          unmarkedBy: userID
        });
      } catch (err) {
        next(err);
      }
    }
  );
  return router;
}
