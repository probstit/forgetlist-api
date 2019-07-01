"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express = require("express");
var authorization_1 = require("../middleware/authorization");
var friendListService_1 = require("../friends/friendListService");
function socialRoutes(friendListRepo, usersRepo) {
    var _this = this;
    var router = express.Router();
    var friendListService = new friendListService_1.FriendListService(friendListRepo);
    // Route for adding a friend.
    router.post("/social/add-friend", authorization_1.isAuthorized, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var userID, friendEmail, friend, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    userID = req.user._id;
                    friendEmail = req.body.email;
                    return [4 /*yield*/, usersRepo.findOne({
                            email: friendEmail
                        })];
                case 1:
                    friend = _a.sent();
                    return [4 /*yield*/, friendListService.addUserToFriendList(userID, friend._id, res)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, friendListService.addUserToFriendList(friend._id, userID, res)];
                case 3:
                    _a.sent();
                    res.json({
                        message: "Successfully added friends."
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _a.sent();
                    next(err_1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Route for removing a friend.
    router["delete"]("/social/remove-friend", authorization_1.isAuthorized, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var userID, friendEmail, friend, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    userID = req.user._id;
                    friendEmail = req.body.email;
                    return [4 /*yield*/, usersRepo.findOne({
                            email: friendEmail
                        })];
                case 1:
                    friend = _a.sent();
                    return [4 /*yield*/, friendListService.removeUserFromFriendList(userID, friend._id, res)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, friendListService.removeUserFromFriendList(friend._id, userID, res)];
                case 3:
                    _a.sent();
                    res.json({
                        message: "Successfully removed friends."
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_2 = _a.sent();
                    next(err_2);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); });
    // Get a users friend list.
    router.get("/social/friends", authorization_1.isAuthorized, function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var userID, friendList, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    userID = req.user._id;
                    return [4 /*yield*/, friendListService.getFriendList(userID, res)];
                case 1:
                    friendList = _a.sent();
                    res.json({ friendList: friendList });
                    return [3 /*break*/, 3];
                case 2:
                    err_3 = _a.sent();
                    next(err_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); });
    return router;
}
exports.socialRoutes = socialRoutes;
