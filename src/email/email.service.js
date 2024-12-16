import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export class EmailService {
    async sendConfirmationEmail(to, name) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject: 'Registration Confirmation',
            text: `Hello dear, ${name}!\n\nThank you for registering! Your account has been successfully created.\n\nBest regards,\nEventus Team`
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log('Confirmation email sent to:', to);
        } catch (error) {
            console.error('Error sending confirmation email:', error);
            throw new Error('Failed to send confirmation email');
        }
    }
}
