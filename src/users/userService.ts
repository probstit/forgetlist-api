import * as jwt from "jsonwebtoken";
import * as express from "express";
import * as bcrypt from "bcrypt";
import { Collection, ObjectID } from "mongodb";

import { Mailer } from "../mailer/mailer";
import { IUser } from "../users/IUser";
import { User } from "./user";
import { IRandomCode } from "../users/IRandomCode";
import { RandomCode } from "./randomCode";

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

  public async registerAccount(
    userData: IUser,
    res: express.Response
  ): Promise<User> {
    // Check if the e-mail is already being used.
    let found = await this.usersRepo.findOne({
      email: userData.email
    });

    if (found) {
      res
        .json({
          message: "E-mail is already being used!"
        })
        .end();
    }

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

    // Send the confirmation e-mail.
    let url = `http://localhost:8000/api/v1.0/users/confirm?code=${code._id}`;
    await this.mailer.send(
      newUser.email,
      url,
      "Account confirmation",
      `Please follow this link ${url} to activate your account.`
    );

    res
      .json({
        message: `A confirmation link has been sent to ${newUser.email}`
      })
      .end();

    return newUser;
  }

  public async confirmAccount(
    codeId: ObjectID,
    res: express.Response
  ): Promise<IUser> {
    // Find confirmation code.
    let foundCode = await this.codesRepo.findOne({
      _id: new ObjectID(codeId)
    });

    if (!foundCode) {
      res
        .json({
          message: "Confirmation code not found!"
        })
        .end();
    }

    // Confirm the account.
    let userData = await this.usersRepo.findOne({
      _id: foundCode.forId
    });

    if (!userData) {
      res
        .json({
          message: "User not found. Please contact the support team."
        })
        .end();
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

    res
      .json({
        message: "Account has been successfully confirmed!"
      })
      .end();

    return user;
  }

  public async login(userData: IUser, res: express.Response): Promise<string> {
    // Find the user.
    let found = await this.usersRepo.findOne({
      email: userData.email
    });

    if (!found) {
      res
        .status(404)
        .json({
          message: "There is no such user with this e-mail."
        })
        .end();
    }

    let user = new User(found);
    let passwordMatch = user.checkPassword(userData.password);
    if (!passwordMatch) {
      res
        .json({
          message: "Wrong password!"
        })
        .end();
    } else {
      let token = jwt.sign({ _id: user._id }, this.jwtSecret);
      res
        .json({
          token
        })
        .end();

      return token;
    }
  }

  public async changePassword(
    userID: ObjectID,
    data: { oldPassword: string; newPassword: string },
    res: express.Response
  ): Promise<void> {
    // Find user
    let found = await this.usersRepo.findOne({
      _id: new ObjectID(userID)
    });

    if (!found) {
      res
        .status(404)
        .json({
          message: "There is no such user with this e-mail."
        })
        .end();
    }

    // Encrypt old password and check if it matches actual password.
    let user = new User(found);

    let passwordMatch = user.checkPassword(data.oldPassword);

    if (!passwordMatch) {
      res
        .status(403)
        .json({
          message: "Old password doesn't match the current password."
        })
        .end();
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

      res
        .json({
          message: "Password has been successfully changed."
        })
        .end();
    }
  }

  public async forgotPassword(
    email: string,
    res: express.Response
  ): Promise<void> {
    let found = await this.usersRepo.findOne({
      email
    });

    if (!found) {
      res
        .status(404)
        .json({
          message: "There is no such user with this e-mail."
        })
        .end();
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
    let url = `http://localhost:8000/api/v1.0/users/reset-password?token=${
      code._id
    }`;
    await this.mailer.send(
      user.email,
      url,
      "Password recovery",
      `Please follow this link ${url} to reset your password.`
    );

    res
      .status(200)
      .json({
        message:
          "An e-mail containing further information has been sent to your e-mail address."
      })
      .end();
  }

  public async resetPassword(
    newPassword: string,
    token: ObjectID,
    res: express.Response
  ): Promise<void> {

    // Find the token.
    let foundToken = await this.passRecoverCodesRepo.findOne({
      _id: new ObjectID(token)
    });

    if (!foundToken) {
      res
        .status(403)
        .json({
          message: 'You are not authorized to perform this action.'
        })
        .end();
    }

    // Find the user.
    let userData = await this.usersRepo.findOne({
      _id: foundToken.forId
    })

    if (!userData) {
      res
        .status(500)
        .json({
          message: 'There has been an error on our side, please contact support team.'
        })
        .end();
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

    res
      .status(200)
      .json({
        message: 'Password has been successfully updated.'
      })
      .end();
  }

  public async getUserById(
    id: ObjectID,
    res: express.Response
  ): Promise<IUser> {
    let user = await this.usersRepo.findOne({
      _id: id
    });

    if (!user) {
      res.json({
        message: "User not found!"
      });
    }

    delete user.password;

    return user;
  }

  public async search(term: string): Promise<IUser[]> {
    if (!term) return [];

    return await this.usersRepo.find({ $text: { $search: term } }).toArray();
  }
}
