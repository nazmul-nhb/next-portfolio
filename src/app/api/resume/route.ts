import { desc, eq } from 'drizzle-orm';
import { sendErrorResponse } from '@/lib/actions/errorResponse';
import { sendResponse } from '@/lib/actions/sendResponse';
import { auth } from '@/lib/auth';
import { db } from '@/lib/drizzle';
import { education, experiences } from '@/lib/drizzle/schema/career';
import { skills } from '@/lib/drizzle/schema/skills';
import { users } from '@/lib/drizzle/schema/users';

/**
 * GET /api/resume - Get resume data (user, experiences, education, skills)
 */
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return sendErrorResponse('Unauthorized', 401);
        }

        const userId = Number.parseInt(session.user.id, 10);

        // Get user details
        const [user] = await db
            .select({
                name: users.name,
                email: users.email,
                profile_image: users.profile_image,
            })
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (!user) {
            return sendErrorResponse('User not found', 404);
        }

        // Get experiences
        const experiencesList = await db
            .select()
            .from(experiences)
            .orderBy(desc(experiences.start_date));

        // Get education
        const educationList = await db
            .select()
            .from(education)
            .orderBy(desc(education.start_date));

        // Get skills
        const skillsList = await db.select().from(skills);

        return sendResponse('User', 'GET', {
            user,
            experiences: experiencesList,
            education: educationList,
            skills: skillsList,
        });
    } catch (error) {
        return sendErrorResponse(error);
    }
}
