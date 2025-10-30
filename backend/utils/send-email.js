/** @format */

import transporter from "../config/nodemailer.js";
import {
  verificationCodeTemplate,
  sendPasswordChangeTemplate,
} from "./email-template.js";

const sendVerificationEmail = async (userEmail, verificationCode) => {
  const { subject, text, html } = verificationCodeTemplate(verificationCode);
  try {
    await transporter.sendMail({
      from: `"VolunteerHub" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
    throw new Error("Email could not be sent");
  }
};

const sendPasswordChangeEmail = async (userEmail, userName) => {
  const { subject, text, html } = sendPasswordChangeTemplate(userName);
  try {
    await transporter.sendMail({
      from: `"VolunteerHub" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: subject,
      text: text,
      html: html,
    });
    console.log(`Password change email sent to ${userEmail}`);
  } catch (error) {
    console.error(`Error sending email to ${userEmail}:`, error);
    throw new Error("Email could not be sent");
  }
};

export default { sendVerificationEmail, sendPasswordChangeEmail };
