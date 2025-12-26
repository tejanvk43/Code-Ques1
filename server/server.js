import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

console.log("Email User:", process.env.EMAIL_USER);
console.log("Email Pass (first 4):", process.env.EMAIL_PASS ? process.env.EMAIL_PASS.substring(0, 4) : "MISSING");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Email Transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

app.post('/api/send-approval-email', async (req, res) => {
    const { email, name, rollNumber, password, loginUrl } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const mailOptions = {
        from: `"Code & Quest Feria" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Registration Approved - Login Credentials',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
                <h2 style="color: #1e3a8a; text-align: center;">Registration Approved! 🎉</h2>
                <p>Dear <strong>${name}</strong>,</p>
                <p>Congratulations! Your registration for the <strong>Code & Quest Feria 2025</strong> has been verified and approved.</p>
                <p>You can now log in to the candidate portal using the credentials below:</p>
                
                <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 5px 0;"><strong>User Name (Roll No):</strong> <span style="font-family: monospace; font-size: 16px;">${rollNumber}</span></p>
                    <p style="margin: 5px 0;"><strong>Password:</strong> <span style="font-family: monospace; font-size: 16px; color: #d97706;">${password}</span></p>
                </div>

                <div style="text-align: center; margin-top: 30px;">
                    <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login Now</a>
                </div>

                <p style="margin-top: 30px; font-size: 12px; color: #6b7280; text-align: center;">
                    If you did not register for this event, please ignore this email.
                </p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${email}`);
        res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, error: 'Failed to send email' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
