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
var mongodb_1 = require("mongodb");
var item_1 = require("./item");
var ItemService = /** @class */ (function () {
    function ItemService(_ItemsRepo) {
        this.itemsRepo = _ItemsRepo;
    }
    // Add an item.
    ItemService.prototype.addItem = function (_item) {
        return __awaiter(this, void 0, void 0, function () {
            var item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = new item_1.Item(_item);
                        // Add it to the collection.
                        return [4 /*yield*/, this.itemsRepo.insertOne(item)];
                    case 1:
                        // Add it to the collection.
                        _a.sent();
                        return [2 /*return*/, item];
                }
            });
        });
    };
    // Delete an item.
    ItemService.prototype.deleteItem = function (itemID, res) {
        return __awaiter(this, void 0, void 0, function () {
            var foundItem, deletedItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.itemsRepo.findOne({
                            _id: new mongodb_1.ObjectID(itemID)
                        })];
                    case 1:
                        foundItem = _a.sent();
                        // Throw an error message if it doesn't exist.
                        if (!foundItem) {
                            res.status(404).json({
                                message: "This item does not exist or it has already been deleted."
                            });
                        }
                        // If it exists in the collection, remove it.
                        return [4 /*yield*/, this.itemsRepo.deleteOne({
                                _id: new mongodb_1.ObjectID(itemID)
                            })];
                    case 2:
                        // If it exists in the collection, remove it.
                        _a.sent();
                        deletedItem = new item_1.Item(foundItem);
                        return [2 /*return*/, deletedItem];
                }
            });
        });
    };
    // Get items for a user.
    ItemService.prototype.getItems = function (userID) {
        return __awaiter(this, void 0, void 0, function () {
            var items;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.itemsRepo.find({ userID: userID }).toArray()];
                    case 1:
                        items = _a.sent();
                        return [2 /*return*/, items];
                }
            });
        });
    };
    // Get an item by ID.
    ItemService.prototype.getItemById = function (itemID) {
        return __awaiter(this, void 0, void 0, function () {
            var foundItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.itemsRepo.findOne({
                            _id: new mongodb_1.ObjectID(itemID)
                        })];
                    case 1:
                        foundItem = _a.sent();
                        return [2 /*return*/, foundItem];
                }
            });
        });
    };
    return ItemService;
}());
exports.ItemService = ItemService;
