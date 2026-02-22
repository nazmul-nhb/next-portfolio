import { and, eq, gt } from 'drizzle-orm';
import type { NextRequest } from 'next/server';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { db } from '@/lib/drizzle';
import { otpCodes } from '@/lib/drizzle/schema/messages';
import { users } from '@/lib/drizzle/schema/users';
import { sendEmail } from '@/lib/email';
import { otpEmailTemplate } from '@/lib/email/templates';
import { OTPSchema, RequestOTPSchema } from '@/lib/zod-schema/users';

/**
 * POST /api/auth/otp - Request a new OTP for email verification.
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = await validateRequest(RequestOTPSchema, body);

        if (!validation.success) return validation.response;

        const { email } = validation.data;

        // Check if user exists
        const [user] = await db
            .select({ id: users.id, name: users.name, email_verified: users.email_verified })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) {
            return sendErrorResponse('No account found with this email', 404);
        }

        if (user.email_verified) {
            return sendErrorResponse('Email is already verified', 400);
        }

        // Generate a 6-digit OTP
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        await db.insert(otpCodes).values({
            email,
            code,
            expires_at: expiresAt,
        });

        // Send OTP email
        await sendEmail({
            to: email,
            subject: 'Verify Your Email - OTP Code',
            html: otpEmailTemplate(user.name, code),
        });

        return sendResponse('OTP', 'POST', { message: 'OTP sent to your email' });
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * PUT /api/auth/otp - Verify an OTP code.
 */
export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();

        const validation = await validateRequest(OTPSchema, body);

        if (!validation.success) return validation.response;

        const { email, code } = validation.data;

        // Find valid OTP
        const [otp] = await db
            .select()
            .from(otpCodes)
            .where(
                and(
                    eq(otpCodes.email, email),
                    eq(otpCodes.code, code),
                    eq(otpCodes.is_used, false),
                    gt(otpCodes.expires_at, new Date())
                )
            )
            .limit(1);

        if (!otp) {
            return sendErrorResponse('Invalid or expired OTP', 400);
        }

        // Mark OTP as used
        await db.update(otpCodes).set({ is_used: true }).where(eq(otpCodes.id, otp.id));

        // Verify user email
        await db.update(users).set({ email_verified: true }).where(eq(users.email, email));

        return sendResponse('OTP', 'OK', { message: 'Email verified successfully' });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
