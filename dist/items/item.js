"use strict";
exports.__esModule = true;
var Item = /** @class */ (function () {
    function Item(data) {
        this._id = data._id;
        this.userID = data.userID;
        this.name = data.name;
        this.quantity = data.quantity;
        this.isBought = data.isBought;
        this.isShared = data.isShared;
        this.sharedWith = data.sharedWith;
    }
    return Item;
}());
exports.Item = Item;
