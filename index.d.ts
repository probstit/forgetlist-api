import { ObjectID } from 'mongodb';

declare namespace Express {
  export interface Request {
     user?: {
       _id: ObjectID;
     }
  }
}