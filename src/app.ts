import * as express from "express";
import * as MongoClient from "mongodb";
import * as bodyParser from "body-parser";
import * as cors from "cors";

// Import routes.
import { userRoutes } from "./routes/users";
import { socialRoutes } from "./routes/social";
import { itemRoutes } from "./routes/items";
import { shareRoutes } from "./routes/share";
// Import app, db and api details from config.json.
import { dbURL, dbName, appPort, apiVers } from "./secret/secret";
// Import error handle middleware.
import { errorHandler } from "./middleware/errorHandle";

const app = express();

MongoClient.connect(dbURL, { useNewUrlParser: true })
  .then(mongoClient => {
    return mongoClient.db(dbName);
  })
  .then(db => {
    const usersCollection = db.collection("users");
    const randomCodesCollection = db.collection("random-codes");
    const passRecoverCodesCollection = db.collection("pass-recover-codes");
    const friendsListCollection = db.collection("friends-list");
    const itemsCollection = db.collection("items");

    const _userRoutes = userRoutes(
      usersCollection,
      randomCodesCollection,
      passRecoverCodesCollection,
      friendsListCollection
    );

    const _scoialRoutes = socialRoutes(
      friendsListCollection,
      usersCollection,
      itemsCollection
    );

    const _itemRoutes = itemRoutes(
      itemsCollection,
      friendsListCollection
    );

    const _shareRoutes = shareRoutes(
      itemsCollection,
      usersCollection,
      friendsListCollection
    );

    app.use(bodyParser.json());
    app.use(cors());
    app.use(apiVers, _userRoutes);
    app.use(apiVers, _scoialRoutes);
    app.use(apiVers, _itemRoutes);
    app.use(apiVers, _shareRoutes);
    app.use(errorHandler);

    app.listen(appPort, () => console.log(`Listening on port ${appPort}`));
  })
  .catch(err => console.log(err));
