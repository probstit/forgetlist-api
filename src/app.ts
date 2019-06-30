require("dotenv").config();
import * as express from "express";
import * as MongoClient from "mongodb";
import * as bodyParser from "body-parser";
import * as cors from "cors";

// Routes.
import { userRoutes } from "./routes/users";

const app = express();
const PORT: number = 8000;
const dbName: string = "Shopify";
const url: string = "mongodb://localhost:27017";

MongoClient.connect(url, { useNewUrlParser: true })
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

    app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
  })
  .catch(err => console.log(err));
