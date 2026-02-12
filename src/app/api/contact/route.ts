import { desc } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { ENV } from '@/configs/env';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { contactMessages } from '@/lib/drizzle/schema/messages';
import { sendEmail } from '@/lib/email/sendEmail';
import { contactAutoReplyTemplate, contactEmailTemplate } from '@/lib/email/templates';
import { ContactFormSchema } from '@/lib/zod-schema/messages';

/**
 * POST /api/contact - Submit a contact form message.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = await validateRequest(ContactFormSchema, body);

        if (!validation.success) return validation.response;

        const { name, email, subject, message } = validation.data;

        // Store the message in the database
        const [stored] = await db
            .insert(contactMessages)
            .values({
                name,
                email,
                subject: subject || null,
                message,
            })
            .returning({ id: contactMessages.id });

        // Send notification email to admin (non-blocking)
        sendEmail({
            to: ENV.adminEmail,
            subject: `New Contact Message: ${subject || 'No Subject'}`,
            html: contactEmailTemplate(name, email, subject || '', message),
        }).catch(console.error);

        // Send auto-response to sender (non-blocking)
        sendEmail({
            to: email,
            subject: 'Thanks for reaching out!',
            html: contactAutoReplyTemplate(name),
        }).catch(console.error);

        return sendResponse('Message', 'POST', {
            id: stored.id,
            message: 'Message sent successfully!',
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * GET /api/contact - Get all contact messages (admin only).
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id || session.user.role !== 'admin') {
            return sendErrorResponse('Forbidden', 403);
        }

        const messages = await db
            .select()
            .from(contactMessages)
            .orderBy(desc(contactMessages.created_at));

        return sendResponse('Message', 'GET', messages);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
