import { eq } from 'drizzle-orm';
import { type NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { validateRequest } from '@/lib/actions/validateRequest';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { testimonials } from '@/lib/drizzle/schema';
import {
    TestimonialCreationSchema,
    TestimonialUpdateSchema,
} from '@/lib/zod-schema/testimonials';

/**
 * * GET all testimonials
 */
export async function GET() {
    try {
        const allTestimonials = await db
            .select()
            .from(testimonials)
            .orderBy(testimonials.created_at);

        return sendResponse('Testimonial', 'GET', allTestimonials);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * * POST - Create new testimonial (admin only)
 */
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await req.json();
        const parsed = await validateRequest(TestimonialCreationSchema, body);

        if (!parsed.success) {
            return parsed.response;
        }

        const [newTestimonial] = await db.insert(testimonials).values(parsed.data).returning();

        revalidatePath('/admin/testimonials');
        revalidatePath('/(home)', 'page');

        return sendResponse('Testimonial', 'POST', newTestimonial);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * * PATCH - Update testimonial (admin only)
 */
export async function PATCH(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const id = req.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Testimonial ID is required' },
                { status: 400 }
            );
        }

        const body = await req.json();
        const parsed = await validateRequest(TestimonialUpdateSchema, body);

        if (!parsed.success) {
            return parsed.response;
        }

        const [updated] = await db
            .update(testimonials)
            .set(parsed.data)
            .where(eq(testimonials.id, Number.parseInt(id)))
            .returning();

        revalidatePath('/admin/testimonials');
        revalidatePath('/(home)', 'page');

        return sendResponse('Testimonial', 'PATCH', updated);
    } catch (error) {
        return sendErrorResponse(error);
    }
}

/**
 * * DELETE - Delete testimonial (admin only)
 */
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const id = req.nextUrl.searchParams.get('id');
        if (!id) {
            return NextResponse.json(
                { success: false, message: 'Testimonial ID is required' },
                { status: 400 }
            );
        }

        await db.delete(testimonials).where(eq(testimonials.id, Number.parseInt(id)));

        revalidatePath('/admin/testimonials');
        revalidatePath('/(home)', 'page');

        return sendResponse('Testimonial', 'DELETE', { id });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
