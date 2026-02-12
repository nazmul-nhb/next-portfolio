import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { ENV } from '@/configs/env';
import {
    blogCategories,
    blogs,
    blogTags,
    categories,
    comments,
    tags,
} from '@/lib/drizzle/schema/blogs';
import { education, experiences } from '@/lib/drizzle/schema/career';
import {
    contactMessages,
    conversations,
    directMessages,
    otpCodes,
} from '@/lib/drizzle/schema/messages';
import { projects } from '@/lib/drizzle/schema/projects';
import { skills } from '@/lib/drizzle/schema/skills';
import { users } from '@/lib/drizzle/schema/users';

const sql = neon(ENV.dbUrl);

export const db = drizzle(sql, {
    schema: {
        users,
        projects,
        skills,
        experiences,
        education,
        blogs,
        tags,
        categories,
        blogTags,
        blogCategories,
        comments,
        contactMessages,
        conversations,
        directMessages,
        otpCodes,
    },
});
