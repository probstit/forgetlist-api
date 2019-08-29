import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { FriendList } from "../domain/friends/friendList";
import { FriendListService } from "../domain/friends/friendListService";
import { IUser } from "../domain/users/IUser";
import { Item } from "../domain/items/item";
import { ShareService } from "../domain/items/shareService";

export function socialRoutes(
  friendListRepo: Collection<FriendList>,
  usersRepo: Collection<IUser>,
  itemsRepo: Collection<Item>
): express.Router {
  const router = express.Router();
  const friendListService: FriendListService = new FriendListService(
    friendListRepo
  );
  const shareService: ShareService = new ShareService(itemsRepo);

  // Route for adding a friend.
  router.post(
    "/social/add-friend",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID: ObjectID = (req as any).user._id;
        let friendEmail: string = req.body.email;
        let friend: IUser = await usersRepo.findOne({
          email: friendEmail
        });

        await friendListService.addUserToFriendList(userID, friend._id);
        await friendListService.addUserToFriendList(friend._id, userID);

        await shareService.shareUserItems(userID, friend._id);
        await shareService.shareUserItems(friend._id, userID);

        res.end();
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for removing a friend.
  router.delete(
    "/social/remove-friend/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        let friendID = new ObjectID(req.params.id);

        await friendListService.removeUserFromFriendList(userID, friendID);
        await friendListService.removeUserFromFriendList(friendID, userID);

        await shareService.hideUserItems(userID, friendID);
        await shareService.hideUserItems(friendID, userID);

        res.end();
      } catch (err) {
        next(err);
      }
    }
  );

  // Get a users friend list.
  router.get(
    "/social/friends",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        let friendList = await friendListService.getFriendList(userID);

        res.json({ friendList });
      } catch (err) {
        next(err);
      }
    }
  );

  // Checks if a user is already a friend
  router.get(
    "/social/is-friend/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        const userID = (req as any).user._id;
        const friendID = new ObjectID(req.params.id);
        const isAlreadyFriend = await friendListService.checkIsFriend(
          userID,
          friendID
        );

        res.json({
          isAlreadyFriend
        });
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
