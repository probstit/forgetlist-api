import * as nodeMailer from "nodemailer";
import {
  smtpHost,
  port,
  isSecure,
  mailService,
  appMail,
  mailPw
} from "../secret/secret";

export class Mailer {
  private transporter: nodeMailer.Transporter;

  constructor() {
    this.transporter = nodeMailer.createTransport({
      host: smtpHost,
      port: port,
      secure: isSecure,
      service: mailService,
      auth: {
        user: appMail,
        pass: mailPw
      }
    });
  }

  async send(email: string, subject: string, text: string) {
    await this.transporter.sendMail({
      from: appMail,
      to: email,
      subject,
      text
    });
  }
}
