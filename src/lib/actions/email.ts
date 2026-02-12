import nodemailer from 'nodemailer';
import { siteConfig } from '@/configs/site';

// Create reusable transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

/**
 * Send an email using nodemailer with Gmail SMTP
 */
export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
    try {
        const info = await transporter.sendMail({
            from: `"${siteConfig.name}" <${process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML tags for text version
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Failed to send email:', error);
        throw error;
    }
}

/**
 * OTP verification email template
 */
export function getOTPEmailTemplate(code: string, name?: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .code-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .code { font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #667eea; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Hi${name ? ` ${name}` : ''},</p>
            <p>Thank you for signing up! Please use the following One-Time Password (OTP) to verify your email address:</p>
            <div class="code-box">
                <div class="code">${code}</div>
            </div>
            <p>This code will expire in <strong>10 minutes</strong>.</p>
            <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Contact form submission email template
 */
export function getContactEmailTemplate(data: {
    name: string;
    email: string;
    message: string;
}): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .info-box { background: white; border-left: 4px solid #667eea; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .label { font-weight: bold; color: #667eea; }
        .message { background: white; padding: 20px; border-radius: 8px; margin-top: 15px; white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Contact Form Submission</h1>
        </div>
        <div class="content">
            <p>You have received a new message from your portfolio contact form:</p>
            <div class="info-box">
                <p><span class="label">From:</span> ${data.name}</p>
                <p><span class="label">Email:</span> ${data.email}</p>
            </div>
            <div class="message">
                <p><span class="label">Message:</span></p>
                <p>${data.message}</p>
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
}

/**
 * Auto-response email template for contact form
 */
export function getContactAutoResponseTemplate(name: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Reaching Out!</h1>
        </div>
        <div class="content">
            <p>Hi ${name},</p>
            <p>Thank you for contacting me through my portfolio website. I've received your message and will get back to you as soon as possible.</p>
            <p>I typically respond within 24-48 hours during business days.</p>
            <p>Best regards,<br>${siteConfig.name}</p>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} ${siteConfig.name}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
    `.trim();
}
