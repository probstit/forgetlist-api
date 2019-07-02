"use strict";
exports.__esModule = true;
var FriendList = /** @class */ (function () {
    function FriendList(data) {
        this._id = data._id;
        this.userID = data.userID;
        this.friendIDs = data.friendIDs;
    }
    return FriendList;
}());
exports.FriendList = FriendList;
