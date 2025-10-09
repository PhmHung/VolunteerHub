import nodemailer from 'nodemailer';

import dotenv from 'dotenv';
dotenv.config({ path: '.env.development.local' });

// Tạo transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER, 
        pass: process.env.SMTP_PASS  
    }
});

export default transporter;
