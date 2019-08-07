import * as nconf from "nconf";

nconf
  .argv()
  .env()
  .file({ file: "../config.json" });

// DB Setup.
const dbURL: string = nconf.get("db:url");
const dbName: string = nconf.get("db:name");
// APP Setup.
const appPort: number = nconf.get("port");
const hostname: string = nconf.get("hostname");
// API Version.
const apiVers: string = nconf.get("api:v");

// Node-mailer options.
const smtpHost: string = nconf.get("email:host");
const port: number = nconf.get("email:port");
const isSecure: boolean = nconf.get("email:secure");
const mailService: string = nconf.get("email:service");
const appMail: string = nconf.get("email:auth:user");
const mailPw: string = nconf.get("email:auth:password");

// JWT
const jwtSecret: string = nconf.get("users:jwtSecret");

export {
  dbURL,
  dbName,
  appPort,
  hostname,
  apiVers,
  smtpHost,
  port,
  isSecure,
  mailService,
  appMail,
  mailPw,
  jwtSecret
};
