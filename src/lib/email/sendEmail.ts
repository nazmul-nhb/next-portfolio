'use server';

import type { SendMailOptions } from 'nodemailer';
import nodemailer from 'nodemailer';
import { ENV } from '@/configs/env';

/** Options for sending an email */
export type EmailOptions = Omit<SendMailOptions, 'from'>;

/**
 * Sends an email using NodeMailer with Gmail SMTP.
 * @param options - Nodemailer send mail options (excluding 'from').
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
    const { email, nodeEnv } = ENV;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: nodeEnv === 'production',
        auth: { user: email.address, pass: email.password },
    });

    await transporter.sendMail({
        ...options,
        from: { name: 'Nazmul Hassan', address: email.address },
    });
}
