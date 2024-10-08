require('dotenv').config(); // Load environment variables from .env file

const nodemailer = require('nodemailer');

// Create a transporter object
const transporter = nodemailer.createTransport({
    service: 'gmail', // or another email provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Example function to send email
const sendPasswordResetEmail = async (to, token) => {
    const resetLink = `http://scatch.com/reset-password/${token}`;

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Click the link to reset your password: ${resetLink}`,
        html: `<p>You requested a password reset. Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
    };

    try {
        await transporter.sendMail(mailOptions);
        // console.log('Password reset email sent.');
    } catch (error) {
        // console.error('Error sending password reset email:', error);
    }
};

module.exports = sendPasswordResetEmail;
