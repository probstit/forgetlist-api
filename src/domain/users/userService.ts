import * as jwt from "jsonwebtoken";
import { context } from "exceptional.js";
import { Collection, ObjectID } from "mongodb";

import { Mailer } from "../../mailer/mailer";
import { IUser } from "./IUser";
import { User } from "./user";
import { IRandomCode } from "./IRandomCode";
import { RandomCode } from "./randomCode";
import { hostname, apiVers, appPort } from "../../secret/secret";

const EXCEPTIONAL = context("default");

export class UserService {
  private mailer: Mailer;
  private usersRepo: Collection<IUser>;
  private codesRepo: Collection<IRandomCode>;
  private passRecoverCodesRepo: Collection<IRandomCode>;
  private jwtSecret: string;

  constructor(
    private _mailer: Mailer,
    private _usersRepo: Collection<IUser>,
    private _codesRepo: Collection<IRandomCode>,
    private _passRecoverCodesRepo: Collection<IRandomCode>,
    private _jwtSecret: string
  ) {
    this.mailer = _mailer;
    this.usersRepo = _usersRepo;
    this.codesRepo = _codesRepo;
    this.passRecoverCodesRepo = _passRecoverCodesRepo;
    this.jwtSecret = _jwtSecret;
  }

  public async registerAccount(userData: IUser): Promise<User> {
    // Check if the e-mail is already being used.
    let found = await this.usersRepo.findOne({
      email: userData.email
    });

    if (found) {
      throw EXCEPTIONAL.ConflictException(0, {
        message: "E-mail address is already being used."
      });
    } else {
      // If the e-mail does not exist, create a new user and add it to the db.
      let newUser: User = new User({
        _id: new ObjectID(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: userData.password,
        active: false
      });

      // Encrypt user password.
      newUser.hashPW(newUser.password);
      // Add user info into db.
      await this.usersRepo.insertOne(newUser);

      // Generate confirmation code and add it to the db.
      let code = new RandomCode({
        _id: new ObjectID(),
        forId: newUser._id
      });
      await this.codesRepo.insertOne(code);

      // Send e-mail for user confirmation.
      let url = `${hostname}${appPort}${apiVers}users/confirm?code=${code._id}`;
      await this.mailer.send(
        newUser.email,
        "Account confirmation",
        `
        <html>
          <head>
           <link href="https://fonts.googleapis.com/css?family=Montserrat|Pacifico&display=swap" rel="stylesheet">
          </head>
          <body>
            <div style="
              background-color: #234789;
              font-family: Montserrat, Verdana, Tahoma, sans-serif;
              text-align: center;
              width: 100%;
              height: 200px;
              padding: 10px;
              color: #fbf5f3;
            ">
              <h1 style="
                font-family: Pacifico";
                margin-top: 140px;
                >Shoppery</h1>
              <h3 style="color: #fbf5f3; margin-top: 50px;">Click on the button below to activate your account.</h1>
              <div style="
                background-color: #fbf5f3;
                font-family: Montserrat, Verdana, Tahoma, sans-serif;
                margin: 10px auto;
                border-style: none;
                border: none;
                display: block;
                font-weight: bold;
                width: 80px;
                height: 25px;
                border-radius: 20px;
                padding: 2px;
              "><a href="${url}" style="color: #234789; text-decoration: none; font-size: 13px;">Activate</a></div>
            </div>
          </body>
        </html>`
      );

      return newUser;
    }
  }

  public async confirmAccount(codeId: ObjectID): Promise<IUser> {
    // Find confirmation code.
    let foundCode = await this.codesRepo.findOne({
      _id: new ObjectID(codeId)
    });

    if (!foundCode) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Confirmation code not found."
      });
    }

    // Confirm the account.
    let userData = await this.usersRepo.findOne({
      _id: foundCode.forId
    });

    if (!userData) {
      throw EXCEPTIONAL.GenericException(0, {
        message: "Something went wrong on our side. Plase contact support team."
      });
    }

    let user = new User(userData);
    user.activate();

    // Update confirmation info in the db.
    await this.usersRepo.updateOne(
      { _id: user._id },
      {
        $set: {
          active: user.active
        }
      }
    );

    return user;
  }

  public async isActivated(userData: IUser): Promise<boolean> {
    //Find the user.
    let found = await this.usersRepo.findOne({
      email: userData.email
    });

    if (!found) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Wrong e-mail or password."
      });
    }

    let user = new User(found);
    let passwordMatch = user.checkPassword(userData.password);
    if (!passwordMatch) {
      throw EXCEPTIONAL.DomainException(0, {
        message: "Wrong password"
      });
    }

    return user.active;
  }

  public async login(userData: IUser): Promise<string> {
    // Find the user.
    let found = await this.usersRepo.findOne({
      email: userData.email
    });

    if (!found) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "Wrong e-mail or password."
      });
    }

    let user = new User(found);

    if (!user.active) {
      throw EXCEPTIONAL.DomainException(0, {
        message: "Please activate your account before logging in."
      });
    }

    let passwordMatch = user.checkPassword(userData.password);
    if (!passwordMatch) {
      throw EXCEPTIONAL.DomainException(0, {
        message: "Wrong password"
      });
    } else {
      let token = jwt.sign({ _id: user._id }, this.jwtSecret);

      return token;
    }
  }

  public async changePassword(
    userID: ObjectID,
    data: { oldPassword: string; newPassword: string }
  ): Promise<void> {
    // Find user
    let found = await this.usersRepo.findOne({
      _id: new ObjectID(userID)
    });

    if (!found) {
      throw EXCEPTIONAL.GenericException(0, {
        message: "Something went wrong on our side. Plase contact support team."
      });
    }

    // Encrypt old password and check if it matches actual password.
    let user = new User(found);

    let passwordMatch = user.checkPassword(data.oldPassword);

    if (!passwordMatch) {
      throw EXCEPTIONAL.GenericException(0, {
        message: "Current password doesn't match the old password."
      });
    } else {
      // Hash the new password and set it as the new one.
      user.hashPW(data.newPassword);

      // Update info into the database.
      await this.usersRepo.updateOne(
        { _id: user._id },
        {
          $set: {
            password: user.password
          }
        }
      );
    }
  }

  public async forgotPassword(userData: IUser): Promise<void> {
    let found = await this.usersRepo.findOne({
      email: userData.email
    });

    if (!found) {
      throw EXCEPTIONAL.DomainException(0, {
        message: "There is no account registered with this e-mail."
      });
    }

    // Encrypt old password and check if it matches actual password.
    let user = new User(found);

    // Generate code for password recovery and add it to the db.
    let code = new RandomCode({
      _id: new ObjectID(),
      forId: user._id
    });
    await this.passRecoverCodesRepo.insertOne(code);

    // Send e-mail regarding password reset.
    let url = `${hostname}${appPort}${apiVers}users/reset-password?token=${
      code._id
    }`;
    await this.mailer.send(
      user.email,
      "Password recovery",
      `Please follow this link ${url} to reset your password.`
    );
  }

  public async resetPassword(
    newPassword: string,
    token: ObjectID
  ): Promise<void> {
    // Find the token.
    let foundToken = await this.passRecoverCodesRepo.findOne({
      _id: new ObjectID(token)
    });

    if (!foundToken) {
      throw EXCEPTIONAL.UnauthorizedException(0, {
        message: "You are not authorized to perform this action."
      });
    }

    // Find the user.
    let userData = await this.usersRepo.findOne({
      _id: foundToken.forId
    });

    if (!userData) {
      throw EXCEPTIONAL.GenericException(0, {
        message: "Something went wrong on our side. Plase contact support team."
      });
    }

    let user = new User(userData);

    // Hash the new password and set it as the new one.
    user.hashPW(newPassword);

    // Update info into the database.
    await this.usersRepo.updateOne(
      { _id: user._id },
      {
        $set: {
          password: user.password
        }
      }
    );
  }

  // Fetch an user by ID.
  public async getUserById(id: ObjectID): Promise<IUser> {
    let user = await this.usersRepo.findOne({
      _id: id
    });

    if (!user) {
      throw EXCEPTIONAL.NotFoundException(0, {
        message: "No user with this id in the database"
      });
    }

    delete user.password;

    return user;
  }

  // Search users.
  public async search(term: string): Promise<IUser[]> {
    if (!term) return [];

    return await this.usersRepo.find({ $text: { $search: term } }).toArray();
  }
}
