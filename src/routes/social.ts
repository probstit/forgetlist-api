import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { FriendList } from "../friends/friendList";
import { FriendListService } from "../friends/friendListService";
import { IUser } from "../users/IUser";

export function socialRoutes(
  friendListRepo: Collection<FriendList>,
  usersRepo: Collection<IUser>
): express.Router {
  const router = express.Router();
  const friendListService: FriendListService = new FriendListService(
    friendListRepo
  );

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

        await friendListService.addUserToFriendList(userID, friend._id, res);
        await friendListService.addUserToFriendList(friend._id, userID, res);

        res.json({
          message: "Successfully added friends."
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Route for removing a friend.
  router.delete(
    "/social/remove-friend",
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

        await friendListService.removeUserFromFriendList(userID, friend._id, res);
        await friendListService.removeUserFromFriendList(friend._id, userID, res);

        res.json({
          message: "Successfully removed friends."
        });
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

        if (!friendList) {
          res.status(404).json({
            message: "There has been an error on our side."
          });
        } else {
          res.json({ friendList });
        }
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}