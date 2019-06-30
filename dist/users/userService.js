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
var jwt = require("jsonwebtoken");
var mongodb_1 = require("mongodb");
var user_1 = require("./user");
var randomCode_1 = require("./randomCode");
var secret_1 = require("../secret/secret");
var UserService = /** @class */ (function () {
    function UserService(_mailer, _usersRepo, _codesRepo, _passRecoverCodesRepo, _jwtSecret) {
        this._mailer = _mailer;
        this._usersRepo = _usersRepo;
        this._codesRepo = _codesRepo;
        this._passRecoverCodesRepo = _passRecoverCodesRepo;
        this._jwtSecret = _jwtSecret;
        this.mailer = _mailer;
        this.usersRepo = _usersRepo;
        this.codesRepo = _codesRepo;
        this.passRecoverCodesRepo = _passRecoverCodesRepo;
        this.jwtSecret = _jwtSecret;
    }
    UserService.prototype.registerAccount = function (userData, res) {
        return __awaiter(this, void 0, void 0, function () {
            var found, newUser, code, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.usersRepo.findOne({
                            email: userData.email
                        })];
                    case 1:
                        found = _a.sent();
                        if (!found) return [3 /*break*/, 2];
                        res
                            .json({
                            message: "E-mail is already being used!"
                        })
                            .end();
                        return [3 /*break*/, 6];
                    case 2:
                        newUser = new user_1.User({
                            _id: new mongodb_1.ObjectID(),
                            firstName: userData.firstName,
                            lastName: userData.lastName,
                            email: userData.email,
                            password: userData.password,
                            active: false
                        });
                        // Encrypt user password.
                        newUser.hashPW(newUser.password);
                        // Add user info into db.
                        return [4 /*yield*/, this.usersRepo.insertOne(newUser)];
                    case 3:
                        // Add user info into db.
                        _a.sent();
                        code = new randomCode_1.RandomCode({
                            _id: new mongodb_1.ObjectID(),
                            forId: newUser._id
                        });
                        return [4 /*yield*/, this.codesRepo.insertOne(code)];
                    case 4:
                        _a.sent();
                        url = secret_1.hostname + "api/v1.0/users/confirm?code=" + code._id;
                        return [4 /*yield*/, this.mailer.send(newUser.email, "Account confirmation", "Please follow this link " + url + " to activate your account.")];
                    case 5:
                        _a.sent();
                        res
                            .json({
                            message: "A confirmation link has been sent to " + newUser.email + "."
                        })
                            .end();
                        return [2 /*return*/, newUser];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.confirmAccount = function (codeId, res) {
        return __awaiter(this, void 0, void 0, function () {
            var foundCode, userData, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.codesRepo.findOne({
                            _id: new mongodb_1.ObjectID(codeId)
                        })];
                    case 1:
                        foundCode = _a.sent();
                        if (!foundCode) {
                            res
                                .json({
                                message: "Confirmation code not found!"
                            })
                                .end();
                        }
                        return [4 /*yield*/, this.usersRepo.findOne({
                                _id: foundCode.forId
                            })];
                    case 2:
                        userData = _a.sent();
                        if (!userData) {
                            res
                                .json({
                                message: "User not found. Please contact the support team."
                            })
                                .end();
                        }
                        user = new user_1.User(userData);
                        user.activate();
                        // Update confirmation info in the db.
                        return [4 /*yield*/, this.usersRepo.updateOne({ _id: user._id }, {
                                $set: {
                                    active: user.active
                                }
                            })];
                    case 3:
                        // Update confirmation info in the db.
                        _a.sent();
                        res
                            .json({
                            message: "Account has been successfully confirmed!"
                        })
                            .end();
                        return [2 /*return*/, user];
                }
            });
        });
    };
    UserService.prototype.login = function (userData, res) {
        return __awaiter(this, void 0, void 0, function () {
            var found, user, passwordMatch, token;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.usersRepo.findOne({
                            email: userData.email
                        })];
                    case 1:
                        found = _a.sent();
                        if (!found) {
                            res
                                .status(404)
                                .json({
                                message: "There is no such user with this e-mail."
                            })
                                .end();
                        }
                        user = new user_1.User(found);
                        passwordMatch = user.checkPassword(userData.password);
                        if (!passwordMatch) {
                            res
                                .status(403)
                                .json({
                                message: "Wrong password!"
                            })
                                .end();
                        }
                        else {
                            token = jwt.sign({ _id: user._id }, this.jwtSecret);
                            res
                                .json({
                                token: token
                            })
                                .end();
                            return [2 /*return*/, token];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.changePassword = function (userID, data, res) {
        return __awaiter(this, void 0, void 0, function () {
            var found, user, passwordMatch;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.usersRepo.findOne({
                            _id: new mongodb_1.ObjectID(userID)
                        })];
                    case 1:
                        found = _a.sent();
                        if (!found) {
                            res
                                .status(404)
                                .json({
                                message: "There is no such user with this e-mail."
                            })
                                .end();
                        }
                        user = new user_1.User(found);
                        passwordMatch = user.checkPassword(data.oldPassword);
                        if (!!passwordMatch) return [3 /*break*/, 2];
                        res
                            .status(403)
                            .json({
                            message: "Old password doesn't match the current password."
                        })
                            .end();
                        return [3 /*break*/, 4];
                    case 2:
                        // Hash the new password and set it as the new one.
                        user.hashPW(data.newPassword);
                        // Update info into the database.
                        return [4 /*yield*/, this.usersRepo.updateOne({ _id: user._id }, {
                                $set: {
                                    password: user.password
                                }
                            })];
                    case 3:
                        // Update info into the database.
                        _a.sent();
                        res
                            .json({
                            message: "Password has been successfully changed."
                        })
                            .end();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.forgotPassword = function (email, res) {
        return __awaiter(this, void 0, void 0, function () {
            var found, user, code, url;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.usersRepo.findOne({
                            email: email
                        })];
                    case 1:
                        found = _a.sent();
                        if (!found) {
                            res
                                .status(404)
                                .json({
                                message: "There is no such user with this e-mail."
                            })
                                .end();
                        }
                        user = new user_1.User(found);
                        code = new randomCode_1.RandomCode({
                            _id: new mongodb_1.ObjectID(),
                            forId: user._id
                        });
                        return [4 /*yield*/, this.passRecoverCodesRepo.insertOne(code)];
                    case 2:
                        _a.sent();
                        url = secret_1.hostname + "api/v1.0/users/reset-password?token=" + code._id;
                        return [4 /*yield*/, this.mailer.send(user.email, "Password recovery", "Please follow this link " + url + " to reset your password.")];
                    case 3:
                        _a.sent();
                        res
                            .status(200)
                            .json({
                            message: "An e-mail containing further informations has been sent to your e-mail address."
                        })
                            .end();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.resetPassword = function (newPassword, token, res) {
        return __awaiter(this, void 0, void 0, function () {
            var foundToken, userData, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.passRecoverCodesRepo.findOne({
                            _id: new mongodb_1.ObjectID(token)
                        })];
                    case 1:
                        foundToken = _a.sent();
                        if (!foundToken) {
                            res
                                .status(403)
                                .json({
                                message: "You are not authorized to perform this action."
                            })
                                .end();
                        }
                        return [4 /*yield*/, this.usersRepo.findOne({
                                _id: foundToken.forId
                            })];
                    case 2:
                        userData = _a.sent();
                        if (!userData) {
                            res
                                .status(500)
                                .json({
                                message: "There has been an error on our side, please contact support team."
                            })
                                .end();
                        }
                        user = new user_1.User(userData);
                        // Hash the new password and set it as the new one.
                        user.hashPW(newPassword);
                        // Update info into the database.
                        return [4 /*yield*/, this.usersRepo.updateOne({ _id: user._id }, {
                                $set: {
                                    password: user.password
                                }
                            })];
                    case 3:
                        // Update info into the database.
                        _a.sent();
                        res
                            .status(200)
                            .json({
                            message: "Password has been successfully updated."
                        })
                            .end();
                        return [2 /*return*/];
                }
            });
        });
    };
    UserService.prototype.getUserById = function (id, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.usersRepo.findOne({
                            _id: id
                        })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            res.json({
                                message: "User not found!"
                            });
                        }
                        delete user.password;
                        return [2 /*return*/, user];
                }
            });
        });
    };
    UserService.prototype.search = function (term) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!term)
                            return [2 /*return*/, []];
                        return [4 /*yield*/, this.usersRepo.find({ $text: { $search: term } }).toArray()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return UserService;
}());
exports.UserService = UserService;
