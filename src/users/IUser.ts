import { ObjectID } from 'mongodb';

export interface IUser {
  _id: ObjectID,
  firstName: string,
  lastName: string,
  email: string,
  password: string,
  active: boolean,
}