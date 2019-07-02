import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { Item } from "../items/item";
import { ItemService } from "../items/itemService";

export function itemRoutes(
  itemsRepo: Collection<Item>
): express.Router {
  const router = express.Router();
  const itemService: ItemService = new ItemService(itemsRepo);
  
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
        let newItem = new Item({
          _id: new ObjectID(),
          userID: (req as any).user._id,
          name: req.body.name,
          quantity: req.body.quantity,
          isBought: false,
          isShared: false,
          sharedWith: []
        });
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
        const deletedItem: Item = await itemService.deleteItem(req.params.id, res);

        res.status(200).json({
          message: "Item has been successfully removed.",
          deletedItem
        })
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
        })
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}