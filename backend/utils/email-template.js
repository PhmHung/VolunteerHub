export const verificationCodeTemplate = (code) => {
    const subject = 'Your Verification Code';
    
    const text = `Hello,\n\nYour verification code is: ${code}\n\nThis code will expire in 5 minutes.\n\nIf you did not request this, please ignore this email.`;

    const html = `
        <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
            <p>Hello,</p>
            <p>Your verification code is:</p>
            <h2 style="color: #2F80ED;">${code}</h2>
            <p>This code will expire in <strong>1 minute</strong>.</p>
            <p>If you did not request this, please ignore this email.</p>
        </div>
    `;

    return { subject, text, html };
};
