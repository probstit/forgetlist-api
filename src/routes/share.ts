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

  // Route for sharing a specific item, with one or more friends.
  router.put(
    "/items/share-with-some/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        // Find the friend.
        let userID = (req as any).user._id;

        let friendEmails: string[] = req.body.emails;
        friendEmails.forEach(async (email: string) => {
          try {
            // Look for the friend in users repo to fetch the _id.
            let foundFriend = await usersRepo.findOne({
              email
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
              await shareService.shareWithSome(
                req.params.id,
                foundFriend._id,
                userID
              );
            } else {
              throw EXCEPTIONAL.DomainException(0, {
                message: "Users are not friends"
              });
            }
          } catch (err) {
            next(err);
          }
        });

        res.json({
          message: "Item successfully shared!"
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for sharing an item with all friends.
  router.put(
    "/items/share-with-all/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userID = (req as any).user._id;
        const userFriendsList = await friendListService.getFriendList(userID);
        await shareService.shareItem(req.params.id, userID, userFriendsList);

        res.json({
          message: "Enabled sharing!"
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
    "/items/hide-list",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const userID = (req as any).user._id;
      await shareService.hideList(userID);

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
    "/items/hide-from-user/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        let friendEmail: string = req.body.email;

        let foundFriend = await usersRepo.findOne({
          email: friendEmail
        });

        if (!foundFriend) {
          throw EXCEPTIONAL.NotFoundException(0, {
            message: "Friend not found!"
          });
        }

        await shareService.hideItemFromUser(
          req.params.id,
          userID,
          foundFriend._id
        );

        res.end();
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
