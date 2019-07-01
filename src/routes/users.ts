import * as express from "express";
import { Collection } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { IUser } from "../users/IUser";
import { IRandomCode } from "../users/IRandomCode";
import { UserService } from "../users/userService";
import { FriendList } from "../friends/friendList";
import { FriendListService } from "../friends/friendListService";
import { jwtSecret } from "../secret/secret";
import { Mailer } from "../mailer/mailer";

export function userRoutes(
  usersRepo: Collection<IUser>,
  codesRepo: Collection<IRandomCode>,
  passRecoverCodesRepo: Collection<IRandomCode>,
  friendsListRepo: Collection<FriendList>
): express.Router {
  const router = express.Router();
  const mailService: Mailer = new Mailer();
  const userService: UserService = new UserService(
    mailService,
    usersRepo,
    codesRepo,
    passRecoverCodesRepo,
    jwtSecret
  );
  const friendListService: FriendListService = new FriendListService(
    friendsListRepo
  );

  // Register route.
  router.post(
    "/users/register",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let newUser = await userService.registerAccount(req.body, res);
        await friendListService.registerFriendList(newUser._id);
      } catch (err) {
        next(err);
      }
    }
  );

  // Account confirmation route.
  router.get(
    "/users/confirm",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.confirmAccount(req.query.code, res);
      } catch (err) {
        next(err);
      }
    }
  );

  // Login route.
  router.post(
    "/users/login",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.login(req.body, res);
      } catch (err) {
        next(err);
      }
    }
  );

  // Change password route.
  router.put(
    "/users/change-password",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.changePassword((req as any).user._id, req.body, res);
        res.end();
      } catch (err) {
        next(err);
      }
    }
  );

  // Forgot password route.
  router.post(
    "/users/forgot-password",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.forgotPassword(req.body.email, res);
      } catch (err) {
        next(err);
      }
    }
  );

  // Reset password route.
  router.put(
    "/users/reset-password",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.resetPassword(
          req.body.newPassword,
          req.query.token,
          res
        );
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
