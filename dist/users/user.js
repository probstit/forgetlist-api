"use strict";
exports.__esModule = true;
var bcrypt = require("bcrypt");
var User = /** @class */ (function () {
    function User(data) {
        this._id = data._id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.email = data.email;
        this.password = data.password;
        this.active = data.active;
    }
    User.prototype.hashPW = function (pw) {
        this.password = bcrypt.hashSync(pw, 12);
    };
    User.prototype.checkPassword = function (pw) {
        return bcrypt.compareSync(pw, this.password);
    };
    User.prototype.activate = function () {
        this.active = true;
    };
    return User;
}());
exports.User = User;
