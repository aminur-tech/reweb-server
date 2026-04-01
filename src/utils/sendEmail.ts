import nodemailer from "nodemailer";
import config from "../config";

export const sendEmail = async (to: string, code: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email
      pass: process.env.EMAIL_PASS, // Your App Password (not your regular password)
    },
  });

  const mailOptions = {
    from: '"REWEB Ecosystem" <noreply@reweb.com>',
    to,
    subject: "Verify your REWEB account",
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #4F46E5;">Welcome to REWEB!</h2>
        <p>Your verification code is:</p>
        <h1 style="background: #f3f4f6; display: inline-block; padding: 10px 20px; border-radius: 5px; letter-spacing: 5px;">
          ${code}
        </h1>
        <p>This code will expire in 10 minutes.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin-top: 20px;" />
        <small style="color: #888;">If you didn't request this, please ignore this email.</small>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};