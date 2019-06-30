import * as express from "express";
import * as MongoClient from "mongodb";
import * as bodyParser from "body-parser";
import * as cors from "cors";

// Import routes.
import { userRoutes } from "./routes/users";
// Import db details from config.json.
import { dbURL, dbName, appPort } from "./secret/secret";

const app = express();

MongoClient.connect(dbURL, { useNewUrlParser: true })
  .then(mongoClient => {
    return mongoClient.db(dbName);
  })
  .then(db => {
    const usersCollection = db.collection("users");
    const randomCodesCollection = db.collection("random-codes");
    const passRecoverCodesCollection = db.collection("pass-recover-codes");

    const _userRoutes = userRoutes(
      usersCollection,
      randomCodesCollection,
      passRecoverCodesCollection
    );

    app.use(bodyParser.json());
    app.use(cors());
    app.use("/api/v1.0", _userRoutes);

    app.listen(appPort, () => console.log(`Listening on port ${appPort}`));
  })
  .catch(err => console.log(err));
