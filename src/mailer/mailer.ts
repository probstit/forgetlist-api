import * as nodeMailer from "nodemailer";
import { mailPw } from "../secret/secret";

const appMail: string = "alex.nodemailer28@gmail.com";

export class Mailer {
  private transporter: nodeMailer.Transporter;

  constructor() {
    this.transporter = nodeMailer.createTransport({
      service: "gmail",
      auth: {
        user: appMail,
        pass: mailPw
      }
    });
  }

  async send(email: string, url: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: appMail,
      to: email,
      subject,
      text
    });
  }
}
