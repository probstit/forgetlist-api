"use strict";
exports.__esModule = true;
var nconf = require("nconf");
nconf.argv().env().file({ file: "../config.json" });
// DB Setup.
var dbURL = nconf.get("db:url");
exports.dbURL = dbURL;
var dbName = nconf.get("db:name");
exports.dbName = dbName;
// APP Setup.
var appPort = nconf.get("port");
exports.appPort = appPort;
var hostname = nconf.get("hostname");
exports.hostname = hostname;
// Node-mailer options.
var smtpHost = nconf.get("email:host");
exports.smtpHost = smtpHost;
var port = nconf.get("email:port");
exports.port = port;
var isSecure = nconf.get("email:secure");
exports.isSecure = isSecure;
var mailService = nconf.get("email:service");
exports.mailService = mailService;
var appMail = nconf.get("email:auth:user");
exports.appMail = appMail;
var mailPw = nconf.get("email:auth:password");
exports.mailPw = mailPw;
// JWT
var jwtSecret = nconf.get("users:jwtSecret");
exports.jwtSecret = jwtSecret;
