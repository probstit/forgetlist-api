"use strict";
exports.__esModule = true;
require("dotenv").config();
var express = require("express");
var MongoClient = require("mongodb");
var bodyParser = require("body-parser");
var cors = require("cors");
// Routes.
var users_1 = require("./routes/users");
var app = express();
var PORT = 8000;
var dbName = "Shopify";
var url = "mongodb://localhost:27017";
MongoClient.connect(url, { useNewUrlParser: true })
    .then(function (mongoClient) {
    return mongoClient.db(dbName);
})
    .then(function (db) {
    var usersCollection = db.collection("users");
    var randomCodesCollection = db.collection("random-codes");
    var passRecoverCodesCollection = db.collection("pass-recover-codes");
    var _userRoutes = users_1.userRoutes(usersCollection, randomCodesCollection, passRecoverCodesCollection);
    app.use(bodyParser.json());
    app.use(cors());
    app.use("/api/v1.0", _userRoutes);
    app.listen(PORT, function () { return console.log("Listening on port " + PORT); });
})["catch"](function (err) { return console.log(err); });
