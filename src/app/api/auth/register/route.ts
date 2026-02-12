import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { ENV } from '@/configs/env';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { db } from '@/lib/drizzle';
import { users } from '@/lib/drizzle/schema/users';
import { sendEmail } from '@/lib/email/sendEmail';
import { welcomeEmailTemplate } from '@/lib/email/templates';
import { RegisterSchema } from '@/lib/zod-schema/users';

/**
 * POST /api/auth/register - Register a new user.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = await validateRequest(RegisterSchema, body);

        if (!validation.success) return validation.response;

        const { name, email, password } = validation.data;

        // Check if user already exists
        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existing) {
            return sendErrorResponse('A user with this email already exists', 409);
        }

        const hashedPassword = await hash(password, 12);

        const [newUser] = await db
            .insert(users)
            .values({
                name,
                email,
                password: hashedPassword,
                role: email === ENV.adminEmail ? 'admin' : 'user',
            })
            .returning({
                id: users.id,
                name: users.name,
                email: users.email,
                role: users.role,
                created_at: users.created_at,
            });

        // Send welcome email (non-blocking)
        sendEmail({
            to: email,
            subject: "Welcome to Nazmul Hassan's Website!",
            html: welcomeEmailTemplate(name),
        }).catch(console.error);

        return sendResponse('User', 'POST', newUser);
    } catch (error) {
        return sendErrorResponse(error);
    }
}
