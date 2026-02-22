'use server';

import { createTransport, type SendMailOptions } from 'nodemailer';
import { ENV } from '@/configs/env';

/** Options for sending an email */
export type EmailOptions = Omit<SendMailOptions, 'from'>;

/**
 * Sends an email using NodeMailer with Gmail SMTP.
 * @param options - Nodemailer send mail options (excluding 'from').
 */
export async function sendEmail(options: EmailOptions) {
    const { email, nodeEnv, adminEmail } = ENV;

    const transporter = createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: nodeEnv === 'production',
        auth: { user: email.address, pass: email.password },
    });

    return await transporter.sendMail({
        ...options,
        from: { name: 'Nazmul Hassan', address: adminEmail },
        text: options.text || options.html?.toString().replace(/<[^>]+>/g, ''),
    });
}
