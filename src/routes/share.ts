import * as express from "express";
import { Collection } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { IItem } from "../domain/items/IItem";
import { ShareService } from "../domain/items/shareService";
import { FriendList } from "../domain/friends/friendList";
import { FriendListService } from "../domain/friends/friendListService";
import { IUser } from "../domain/users/IUser";
import { context } from "exceptional.js";

const EXCEPTIONAL = context("default");

export function shareRoutes(
  itemsRepo: Collection<IItem>,
  usersRepo: Collection<IUser>,
  friendsRepo: Collection<FriendList>
): express.Router {
  const router = express.Router();
  const shareService: ShareService = new ShareService(itemsRepo);
  const friendListService: FriendListService = new FriendListService(
    friendsRepo
  );

  // Route for sharing a specific item, with a friend.
  router.put(
    "/items/share-item/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        // Find the friend.
        let userID = (req as any).user._id;
        let foundFriend = await usersRepo.findOne({
          email: req.body.email
        });

        if (!foundFriend) {
          throw EXCEPTIONAL.NotFoundException(0, {
            message: "Friend not found."
          });
        }
        // Find user's friend list.
        let foundFriendList = await friendsRepo.findOne({
          userID
        });

        if (!foundFriendList) {
          throw EXCEPTIONAL.NotFoundException(0, {
            message: "Friend list not found."
          });
        }
        // Check if the users are friends.
        let isFriend = false;

        foundFriendList.friendIDs.forEach(friendID => {
          if (friendID.toString() === foundFriend._id.toString()) {
            isFriend = true;
          }
        });
        // Only allow sharing the item if the users are friends.
        if (isFriend) {
          await shareService.shareItem(req.params.id, foundFriend._id, userID);
        } else {
          res.json({
            message:
              "In order to be able to share an item, users must be friends!"
          });
        }

        res.json({
          message: "Item successfully shared!"
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for enabling sharing an item with all friends.
  router.put(
    "/items/enable-share-one/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userID = (req as any).user._id;
        const userFriendsList = await friendListService.getFriendList(userID);
        await shareService.allowSharingForOne(
          req.params.id,
          userID,
          userFriendsList
        );

        res.json({
          message: "Enabled sharing!"
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for sharing all private items.
  router.put(
    "/items/enable-share-all",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        const userFriendsList = await friendListService.getFriendList(userID);
        await shareService.allowSharingForAll(userID, userFriendsList);

        res.json({
          message: "All private items are now being shared."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for sharing the whole list with everyone.
  router.put(
    "/items/share-list",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        const userFriendsList = await friendListService.getFriendList(userID);
        await shareService.shareListWithAllFriends(userID, userFriendsList);

        res.json({
          message: "Your list is now being shared with your friends."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for setting all items as private.
  router.put(
    "/items/block-share-all",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const userID = (req as any).user._id;
      await shareService.blockSharingForAll(userID);

      res.json({
        message: "All public items are now set as private."
      });
    }
  );

  // Route for hiding a specific item from all users.
  router.put(
    "/items/hide-item/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const removedAccessTo = await shareService.hideItem(
          req.params.id,
          (req as any).user._id
        );

        res.json({
          message: "Item successfully hidden",
          removedAccessTo
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for hiding an item from a user.
  router.put(
    "/items/hide-from-one/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        let foundFriend = await usersRepo.findOne({
          email: req.body.email
        });

        if (!foundFriend) {
          throw EXCEPTIONAL.NotFoundException(0, {
            message: "Friend not found!"
          });
        }

        await shareService.hideItemFromOne(
          req.params.id,
          userID,
          foundFriend._id
        );

        res.json({
          message: "Item successfully hidden."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
