import { ObjectID } from 'mongodb';
import * as bcrypt from 'bcrypt';

import { IUser } from './IUser';

export class User implements IUser {
  public _id: ObjectID;
  public firstName: string;
  public lastName: string;
  public email: string;
  public password: string;
  public active: boolean

  constructor(data: IUser) {
    this._id = data._id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.email = data.email;
    this.password = data.password;
    this.active = data.active;
  }

  public hashPW(pw: string): void {
    this.password = bcrypt.hashSync(pw, 12);
  }

  public checkPassword(pw: string) : boolean {
    return bcrypt.compareSync(pw, this.password);
  }

  public activate(): void {
    this.active = true;
  }
}
