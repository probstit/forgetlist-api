"use strict";
exports.__esModule = true;
var express = require("express");
var MongoClient = require("mongodb");
var bodyParser = require("body-parser");
var cors = require("cors");
// Import routes.
var users_1 = require("./routes/users");
// Import db details from config.json.
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
    var _userRoutes = users_1.userRoutes(usersCollection, randomCodesCollection, passRecoverCodesCollection);
    app.use(bodyParser.json());
    app.use(cors());
    app.use("/api/v1.0", _userRoutes);
    app.listen(secret_1.appPort, function () { return console.log("Listening on port " + secret_1.appPort); });
})["catch"](function (err) { return console.log(err); });
