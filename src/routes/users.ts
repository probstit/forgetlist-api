import * as express from "express";
import { Collection, ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { IUser } from "../domain/users/IUser";
import { IRandomCode } from "../domain/users/IRandomCode";
import { UserService } from "../domain/users/userService";
import { FriendList } from "../domain/friends/friendList";
import { FriendListService } from "../domain/friends/friendListService";
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
        let newUser = await userService.registerAccount(req.body);
        await friendListService.registerFriendList(newUser._id);

        res
          .status(200)
          .json({
            message:
              "Account has been successfully created. A confirmation e-mail has been sent to your e-mail address."
          })
          .end();
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
        const user = await userService.confirmAccount(
          new ObjectID(req.query.code)
        );

        const token = await userService.generateToken(user._id);
        res
          .status(200)
          .json({
            isActive: user.active,
            token,
            message: "Account has been successfully activated."
          })
          .end();
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
        let jwt = await userService.login(req.body);
        res.json({
          accessToken: jwt
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Fetch "me" profile.
  router.get(
    "/users/me",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = (req as any).user._id;
        let user = await userService.getUserById(userID);
        res.json({
          user
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Fetch a user data
  router.get(
    "/users/user/:id",
    isAuthorized,
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        let userID = new ObjectID(req.params.id);
        let user = await userService.getUserById(userID);
        res.json({
          user
        });
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
        await userService.changePassword((req as any).user._id, req.body);
        res
          .status(200)
          .json({
            message: "Password has been successfully changed."
          })
          .end();
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
        await userService.forgotPassword(req.body);
        res
          .status(200)
          .json({
            message:
              "An e-mail containing further informations has been sent to your e-mail address."
          })
          .end();
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
        await userService.resetPassword(req.body.newPassword, req.query.token);
        res
          .status(200)
          .json({
            message: "Password has been successfully updated."
          })
          .end();
      } catch (err) {
        next(err);
      }
    }
  );

  return router;
}
