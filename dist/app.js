"use strict";
exports.__esModule = true;
var express = require("express");
var MongoClient = require("mongodb");
var bodyParser = require("body-parser");
var cors = require("cors");
// Import routes.
var users_1 = require("./routes/users");
var social_1 = require("./routes/social");
var items_1 = require("./routes/items");
// Import app, db and api details from config.json.
var secret_1 = require("./secret/secret");
var app = express();
MongoClient.connect(secret_1.dbURL, { useNewUrlParser: true })
    .then(function (mongoClient) {
    return mongoClient.db(secret_1.dbName);
})
    .then(function (db) {
    var usersCollection = db.collection("users");
    var randomCodesCollection = db.collection("random-codes");
    var passRecoverCodesCollection = db.collection("pass-recover-codes");
    var friendsListCollection = db.collection("friends-list");
    var itemsCollection = db.collection("items");
    var _userRoutes = users_1.userRoutes(usersCollection, randomCodesCollection, passRecoverCodesCollection, friendsListCollection);
    var _scoialRoutes = social_1.socialRoutes(friendsListCollection, usersCollection);
    var _itemRoutes = items_1.itemRoutes(itemsCollection);
    app.use(bodyParser.json());
    app.use(cors());
    app.use(secret_1.apiVers, _userRoutes);
    app.use(secret_1.apiVers, _scoialRoutes);
    app.use(secret_1.apiVers, _itemRoutes);
    app.listen(secret_1.appPort, function () { return console.log("Listening on port " + secret_1.appPort); });
})["catch"](function (err) { return console.log(err); });
