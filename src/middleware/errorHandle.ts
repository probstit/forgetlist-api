import { HttpException } from "exceptional.js";

export function errorHandler (err, req, res, next) {
  try {
    let httpEx = new HttpException(err);
    res.status(httpEx.statusCode).json(httpEx.error);
  } catch (err) {
    res.status(500).end();
  }
}