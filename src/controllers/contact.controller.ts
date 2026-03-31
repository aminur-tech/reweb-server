import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { Contact } from '../models/contact.model';

const sendContactEmail = async (req: Request, res: Response) => {
  try {
    const { name, email, service, message } = req.body;

    // 1. Save to Database
    const newContact = await Contact.create({ name, email, service, message });

    // 2. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use App Password
      },
    });

    // 3. Professional Email HTML Template
    const htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; color: #333; border: 1px solid #eee;">
        <h2 style="color: #6366f1;">New Project Inquiry</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Requested Service:</strong> <span style="background: #f3f4f6; padding: 2px 8px; border-radius: 4px;">${service}</span></p>
        <div style="margin-top: 20px; padding: 15px; background: #fafafa; border-left: 4px solid #6366f1;">
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
        <p style="font-size: 12px; color: #999; margin-top: 30px;">This inquiry was sent from your portfolio contact form.</p>
      </div>
    `;

    // 4. Send Email
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.EMAIL_USER,
      subject: `🚀 New Inquiry: ${service} from ${name}`,
      html: htmlContent,
    });

    res.status(200).json({
      success: true,
      message: 'Transmission Successful',
      data: newContact
    });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

export const contactControllers = { sendContactEmail };