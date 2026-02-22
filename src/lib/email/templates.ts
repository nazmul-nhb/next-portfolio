import { getCurrentYear } from '@/lib/utils';

/**
 * Generates an attractive HTML email template for OTP verification.
 * @param name - Recipient's name.
 * @param otp - The one-time password code.
 * @returns HTML string for the email body.
 */
export function otpEmailTemplate(name: string, otp: string): string {
    return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;font-weight:700;">Email Verification</h1>
            </div>
            <div style="padding:32px 24px;">
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 24px;">Use the following code to verify your email address. This code expires in <strong>10 minutes</strong>.</p>
                <div style="background:#f8f9fe;border:2px dashed #667eea;border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
                    <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:#667eea;">${otp}</span>
                </div>
                <p style="color:#85878e;font-size:14px;line-height:1.5;margin:0;">If you didn't request this code, please ignore this email or contact us if you have concerns.</p>
            </div>
            <div style="background:#f4f4f7;padding:16px 24px;text-align:center;">
                <p style="color:#a8aaaf;font-size:12px;margin:0;">&copy; ${getCurrentYear()} Nazmul Hassan. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
}

/**
 * Generates an HTML email template for contact form submissions.
 * @param name - Sender's name.
 * @param senderEmail - Sender's email.
 * @param subject - Message subject.
 * @param message - Message content.
 * @returns HTML string for the email body.
 */
export function contactEmailTemplate(
    name: string,
    senderEmail: string,
    subject: string,
    message: string
): string {
    return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#11998e 0%,#38ef7d 100%);padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:22px;">New Contact Message</h1>
            </div>
            <div style="padding:32px 24px;">
                <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
                    <tr><td style="padding:8px 0;color:#85878e;font-size:14px;width:90px;">From:</td><td style="padding:8px 0;color:#333;font-size:14px;font-weight:600;">${name}</td></tr>
                    <tr><td style="padding:8px 0;color:#85878e;font-size:14px;">Email:</td><td style="padding:8px 0;color:#333;font-size:14px;">${senderEmail}</td></tr>
                    <tr><td style="padding:8px 0;color:#85878e;font-size:14px;">Subject:</td><td style="padding:8px 0;color:#333;font-size:14px;">${subject || 'No subject'}</td></tr>
                </table>
                <div style="background:#f8faf9;border-left:4px solid #11998e;border-radius:4px;padding:16px;margin:0;">
                    <p style="color:#51545e;font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">${message}</p>
                </div>
            </div>
            <div style="background:#f4f4f7;padding:16px 24px;text-align:center;">
                <p style="color:#a8aaaf;font-size:12px;margin:0;">Sent via portfolio contact form</p>
            </div>
        </div>
    </body>
    </html>`;
}

/**
 * Generates an HTML auto-response email for contact form senders.
 * @param name - The sender's name.
 * @returns HTML string for the auto-response email body.
 */
export function contactAutoReplyTemplate(name: string): string {
    return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:22px;">Thanks for reaching out!</h1>
            </div>
            <div style="padding:32px 24px;">
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 16px;">Thank you for your message! I've received it and will get back to you within <strong>24-48 hours</strong>.</p>
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 24px;">In the meantime, feel free to check out my latest projects and blog posts on my website.</p>
                <div style="text-align:center;">
                    <a href="https://nazmul-nhb.dev" style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Visit My Website</a>
                </div>
            </div>
            <div style="background:#f4f4f7;padding:16px 24px;text-align:center;">
                <p style="color:#a8aaaf;font-size:12px;margin:0;">&copy; ${getCurrentYear()} Nazmul Hassan. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
}

/**
 * Generates a welcome email template for new user registrations.
 * @param name - The new user's name.
 * @returns HTML string for the welcome email body.
 */
export function welcomeEmailTemplate(name: string): string {
    return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:24px;">Welcome!</h1>
            </div>
            <div style="padding:32px 24px;">
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 16px;">Hi <strong>${name}</strong>,</p>
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 16px;">Welcome to my website! Your account has been created successfully.</p>
                <p style="color:#51545e;font-size:16px;line-height:1.6;margin:0 0 24px;">You can now write blog posts, interact with other users, and explore all features. Don't forget to verify your email to unlock all capabilities!</p>
                <div style="text-align:center;">
                    <a href="https://nazmul-nhb.dev/blogs/new" style="display:inline-block;background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%);color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;">Start Writing</a>
                </div>
            </div>
            <div style="background:#f4f4f7;padding:16px 24px;text-align:center;">
                <p style="color:#a8aaaf;font-size:12px;margin:0;">&copy; ${getCurrentYear()} Nazmul Hassan. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
}
