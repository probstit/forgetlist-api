import * as jwt from "jsonwebtoken";
import * as express from "express";
import { ObjectID } from "mongodb";
import { key } from "../secret/secret";

export function isAuthorized(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  if (typeof authHeader === "string") {
    let token = authHeader as string;
    if (!token) {
      res.status(403).json({ message: "Access denied!" });
    }

    token = token.substr("Bearer ".length);
    let decoded = jwt.decode(token) as any;
    if (!decoded) {
      res.status(403).json({ message: "Access denied!" });
    }

    jwt.verify(token, key, (err, decodedToken) => {
      if (err) {
        res.status(403).json({
          message: "Access denied!"
        });
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
    res.status(403).json({
      message: "Access denied!"
    });
  }
}
