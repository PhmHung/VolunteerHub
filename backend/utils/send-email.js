import transporter from '../config/nodemailer.js';
import { verificationCodeTemplate } from './email-template.js';

export const sendVerificationEmail = async (email, code) => {
    const { subject, text, html } = verificationCodeTemplate(code);

    try {
        const info = await transporter.sendMail({
            from: `"VolunteerHub" <${process.env.SMTP_USER}>`,
            to: email,
            subject,
            text,
            html
        });
    } catch (error) {
        throw error;
    }
};

export default sendVerificationEmail;
