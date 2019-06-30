import * as express from "express";
import { ObjectID } from "mongodb";

import { isAuthorized } from "../middleware/authorization";
import { UserService } from "../users/userService";
import { key } from "../secret/secret";
import { Mailer } from "../mailer/mailer";

const router = express.Router();

type RequestWithUser = { user?: { _id: ObjectID } } & express.Request;

export function userRoutes(
  usersRepo,
  codesRepo,
  passRecoverCodesRepo
): express.Router {
  const mailService: Mailer = new Mailer();
  const userService: UserService = new UserService(
    mailService,
    usersRepo,
    codesRepo,
    passRecoverCodesRepo,
    key
  );

  // Register route
  router.post(
    "/users/register",
    async (
      req: RequestWithUser,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.registerAccount(req.body, res);
      } catch (err) {
        next(err);
      }
    }
  );

  // Account confirmation route.
  router.get(
    "/users/confirm",
    async (
      req: RequestWithUser,
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
      req: RequestWithUser,
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
      req: RequestWithUser,
      res: express.Response,
      next: express.NextFunction
    ) => {
      try {
        await userService.changePassword(req.user._id, req.body, res);
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
      req: RequestWithUser,
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
      req: RequestWithUser,
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
