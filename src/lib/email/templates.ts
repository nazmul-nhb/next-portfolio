import { getTimestamp } from 'nhb-toolbox';
import { siteConfig } from '@/configs/site';
import { getCurrentYear } from '@/lib/utils';

const THEME = {
    /** Primary gradient (steelblue → ocean blue) */
    gradient: 'linear-gradient(135deg, #1a5276 0%, #2e86c1 100%)',
    /** Solid fallback for clients that don't support gradients (e.g. Yahoo) */
    gradientFallback: '#4682B4',
    /** Accent color used for borders, OTP text, highlights */
    accent: '#2e86c1',
    /** Light accent background (for OTP box, message box, etc.) */
    accentBg: '#eaf2f8',
    /** Body / page background */
    pageBg: '#f4f4f7',
    /** Card background */
    cardBg: '#ffffff',
    /** Primary text color */
    text: '#51545e',
    /** Secondary / muted text color */
    mutedText: '#85878e',
    /** Footer text color */
    footerText: '#a8aaaf',
    /** Bold / heading text color */
    strongText: '#333333',
    /** Font stack */
    font: "'Segoe UI',Tahoma,Geneva,Verdana,sans-serif",
} as const;

/** Reusable inline style snippets */
const s = {
    p: `color:${THEME.text};font-size:16px;line-height:1.6;margin:0 0 16px;`,
    pLast: `color:${THEME.text};font-size:16px;line-height:1.6;margin:0 0 24px;`,
    muted: `color:${THEME.mutedText};font-size:14px;line-height:1.5;margin:0;`,
    btn: `display:inline-block;background-color:${THEME.gradientFallback};background:${THEME.gradient};color:#ffffff;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:14px;font-weight:600;`,
} as const;

/**
 * Wraps email body content in a consistent outer layout (html, head, body, card, header, footer).
 * @param title - Header banner text.
 * @param body  - Inner HTML content string.
 * @param footerNote - Optional footer text override (defaults to copyright).
 */
function emailLayout(title: string, body: string, footerNote?: string): string {
    const footer =
        footerNote ?? `© ${getCurrentYear()} ${siteConfig.name}. All rights reserved.`;

    return /* html */ `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background:${THEME.pageBg};font-family:${THEME.font};">
        <div style="max-width:560px;margin:40px auto;background:${THEME.cardBg};border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
            <div style="background-color:${THEME.gradientFallback};background:${THEME.gradient};padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:20px;font-weight:700;">${title}</h1>
            </div>
            <div style="padding:32px 24px;">
                ${body}
            </div>
            <div style="background:${THEME.pageBg};padding:16px 24px;text-align:center;">
                <p style="color:${THEME.footerText};font-size:12px;margin:0;">${footer}</p>
                <p style="${s.muted}font-size:10px;text-align:center;">${getTimestamp()}</p>
            </div>
        </div>
    </body>
    </html>`;
}

// ── Templates ───────────────────────────────────────────────────────

/**
 * Generates an HTML email template for OTP verification.
 * @param name - Recipient's name.
 * @param otp - The one-time password code.
 * @returns HTML string for the email body.
 */
export function otpEmailTemplate(name: string, otp: string): string {
    const content = /* html */ `
    <p style="${s.p}">
        Hi <strong>${name}</strong>,
    </p>

    <p style="${s.pLast}">
        Use the following code to verify your email address. This code expires in <strong>10 minutes</strong>.
    </p>

    <div style="background:${THEME.accentBg};border:2px dashed ${THEME.accent};border-radius:8px;padding:20px;text-align:center;margin:0 0 24px;">
        <span style="font-size:36px;font-weight:700;letter-spacing:8px;color:${THEME.accent};">${otp}</span>
    </div>

    <p style="${s.muted}">
        If you didn't request this code, please ignore this email or contact us if you have concerns.
    </p>`;

    return emailLayout('Email Verification', content);
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
    const content = /* html */ `
    <table style="width:100%;border-collapse:collapse;margin:0 0 24px;">
        <tr>
            <td style="padding:8px 0;color:${THEME.mutedText};font-size:14px;width:90px;">From:</td>
            <td style="padding:8px 0;color:${THEME.strongText};font-size:14px;font-weight:600;">${name}</td>
        </tr>
        <tr>
            <td style="padding:8px 0;color:${THEME.mutedText};font-size:14px;">Email:</td>
            <td style="padding:8px 0;color:${THEME.strongText};font-size:14px;">${senderEmail}</td>
        </tr>
        <tr>
            <td style="padding:8px 0;color:${THEME.mutedText};font-size:14px;">Subject:</td>
            <td style="padding:8px 0;color:${THEME.strongText};font-size:14px;">${subject || 'No subject'}</td>
        </tr>
    </table>

    <div style="background:${THEME.accentBg};border-left:4px solid ${THEME.accent};border-radius:4px;padding:16px;margin:0;">
        <p style="color:${THEME.text};font-size:15px;line-height:1.6;margin:0;white-space:pre-wrap;">
            ${message}
        </p>
    </div>`;

    return emailLayout('New Contact Message', content, 'Sent via portfolio contact form');
}

/**
 * Generates an HTML auto-response email for contact form senders.
 * @param name - The sender's name.
 * @returns HTML string for the auto-response email body.
 */
export function contactAutoReplyTemplate(name: string): string {
    const content = /* html */ `
    <p style="${s.p}">
        Hi <strong>${name}</strong>,
    </p>

    <p style="${s.p}">
        Thank you for your message! I've received it and will get back to you within <strong>24-48 hours</strong>.
    </p>

    <p style="${s.pLast}">
        In the meantime, feel free to check out my latest projects and blog posts on my website.
    </p>

    <div style="text-align:center;">
        <a href="${siteConfig.baseUrl}" style="${s.btn}">
            Visit My Website
        </a>
    </div>`;

    return emailLayout('Thanks for reaching out!', content);
}

/**
 * Generates a welcome email template for new user registrations.
 * @param name - The new user's name.
 * @returns HTML string for the welcome email body.
 */
export function welcomeEmailTemplate(name: string): string {
    const content = /* html */ `
    <p style="${s.p}">
        Hi <strong>${name}</strong>,
    </p>

    <p style="${s.p}">
        Welcome to my website! Your account has been created successfully.
    </p>

    <p style="${s.pLast}">
        You can now write blog posts, interact with other users, and explore all features. Don't forget to verify your email to unlock all capabilities!
    </p>

    <div style="text-align:center;">
        <a href="${siteConfig.baseUrl}/blogs/new" style="${s.btn}">
            Start Writing
        </a>
    </div>`;

    return emailLayout('Welcome!', content);
}
