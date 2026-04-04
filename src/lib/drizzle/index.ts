import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleHttp } from 'drizzle-orm/neon-http';
// import { drizzle as drizzleServerless } from 'drizzle-orm/neon-serverless';
import { ENV } from '@/configs/env';
import { pollOptions, polls, pollVotes } from '@/lib/drizzle/schema';
import {
    blogCategories,
    blogs,
    blogTags,
    categories,
    comments,
    tags,
} from '@/lib/drizzle/schema/blogs';
import { education, experiences } from '@/lib/drizzle/schema/career';
import { expenses, loanPayments, loans, receipts } from '@/lib/drizzle/schema/expenses';
import {
    contactMessages,
    conversations,
    directMessages,
    otpCodes,
} from '@/lib/drizzle/schema/messages';
import { projects } from '@/lib/drizzle/schema/projects';
import { skills } from '@/lib/drizzle/schema/skills';
import { testimonials } from '@/lib/drizzle/schema/testimonials';
import { users } from '@/lib/drizzle/schema/users';

const neonSql = neon(ENV.dbUrl);
// const neonPool = new Pool({ connectionString: ENV.dbUrl });

const schema = {
    users,
    projects,
    skills,
    experiences,
    education,
    testimonials,
    blogs,
    tags,
    categories,
    blogTags,
    blogCategories,
    comments,
    expenses,
    loans,
    loanPayments,
    receipts,
    contactMessages,
    conversations,
    directMessages,
    otpCodes,
    polls,
    pollVotes,
    pollOptions,
};

export const db = drizzleHttp(neonSql, { schema });

// export const db =
//     ENV.nodeEnv === 'development'
//         ? drizzleServerless(neonPool, { schema })
//         : drizzleHttp(neonQueryFn, { schema });
