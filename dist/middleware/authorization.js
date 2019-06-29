"use strict";
exports.__esModule = true;
var jwt = require("jsonwebtoken");
var mongodb_1 = require("mongodb");
var secret_1 = require("../secret/secret");
function isAuthorized(req, res, next) {
    var authHeader = req.headers["authorization"] || req.headers["Authorization"];
    if (typeof authHeader === "string") {
        var token = authHeader;
        if (!token) {
            res.status(403).json({ message: "Access denied!" });
        }
        token = token.substr("Bearer ".length);
        var decoded = jwt.decode(token);
        if (!decoded) {
            res.status(403).json({ message: "Access denied!" });
        }
        jwt.verify(token, secret_1.key, function (err, decodedToken) {
            if (err) {
                res.status(403).json({
                    message: "Access denied!"
                });
            }
            else {
                Object.defineProperty(req, "user", {
                    value: {
                        _id: new mongodb_1.ObjectID(decodedToken._id)
                    }
                });
                next();
            }
        });
    }
    else {
        res.status(403).json({
            message: "Access denied!"
        });
    }
}
exports.isAuthorized = isAuthorized;
