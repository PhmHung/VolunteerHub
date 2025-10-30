/** @format */

const verificationCodeTemplate = (code) => {
  const subject = "Your Verification Code";

  const text = `Hello,\n\nYour verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.`;

  const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <p>Hello,</p>
            <p>Your verification code is:</p>
            <h2 style="color: #2F80ED;">${code}</h2>
            <p>This code will expire in <strong>5 minute</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;

  return { subject, text, html };
};

const sendPasswordChangeTemplate = (userName) => {
  const subject = "Your Password Has Been Changed";
  const text = `Hello ${userName},\n\nThis is a confirmation that the password for your account has just been changed.\n\nIf you did not make this change, please contact our support team immediately.`;
  const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <p>Hello ${userName},</p>
            <p>This is a confirmation that the password for your account has just been changed.</p>
            <p>If you did not make this change, please contact our support team immediately.</p>
        </div>
    `;
  return { subject, text, html };
};
export { verificationCodeTemplate, sendPasswordChangeTemplate };
