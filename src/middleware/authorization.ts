import * as jwt from "jsonwebtoken";
import * as express from "express";
import { ObjectID } from "mongodb";
import { context } from "exceptional.js";

import { jwtSecret } from "../secret/secret";

const EXCEPTIONAL = context("default");

export function isAuthorized(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader =
    req.headers["authorization"] || req.headers["Authorization"];

  if (typeof authHeader === "string") {
    let token = authHeader as string;

    if (!token) {
      return next(
        EXCEPTIONAL.UnauthorizedException(0, {
          message: "Unauthorized access, please login."
        })
      );
    }

    token = token.substr("Bearer ".length);
    let decoded = jwt.decode(token) as any;
    if (!decoded) {
      return next(
        EXCEPTIONAL.UnauthorizedException(0, {
          message: "Unauthorized access, please login."
        })
      );
    }

    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      if (err) {
        return next(
          EXCEPTIONAL.UnauthorizedException(0, {
            message: "Unauthorized access, please login."
          })
        );
      } else {
        Object.defineProperty(req, "user", {
          value: {
            _id: new ObjectID((decodedToken as any)._id)
          }
        });
        next();
      }
    });
  } else {
    return next(
      EXCEPTIONAL.UnauthorizedException(0, {
        message: "Unauthorized access, please login."
      })
    );
  }
}
