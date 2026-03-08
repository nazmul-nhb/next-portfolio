import { asc, eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { ENV } from '@/configs/env';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema/skills';
import { users } from '@/lib/drizzle/schema/users';
import type { SelectSkill } from '@/types/skills';
import { CareerHighlightsSection } from './_components/CareerHighlights';
import { HeroSection } from './_components/HeroSection';
import { RecentBlogsSection } from './_components/RecentBlogs';
import { RecentProjectsSection } from './_components/RecentProjects';
import { SkillsSection } from './_components/SkillsSection';
import { TestimonialsSection } from './_components/Testimonials';

export const revalidate = 60; // ISR: revalidate every minute

export const metadata: Metadata = {
    title: {
        absolute: siteConfig.name,
    },
    description: siteConfig.description,
    keywords: [...siteConfig.keywords, ...Object.values(siteConfig.links)],
    alternates: { canonical: new URL(siteConfig.baseUrl) },
    openGraph: {
        title: {
            absolute: siteConfig.name,
        },
        description: siteConfig.description,
        url: siteConfig.baseUrl,
        siteName: siteConfig.name,
        type: 'website',
    },
};

export default async function HomePage() {
    let allSkills: SelectSkill[] = [];
    let adminImage: string | null = null;

    try {
        const [skillsResult, [admin]] = await Promise.all([
            db.select().from(skills).orderBy(asc(skills.sort_order), asc(skills.title)),
            db
                .select({ profile_image: users.profile_image })
                .from(users)
                .where(eq(users.email, ENV.adminEmail))
                .limit(1),
        ]);
        allSkills = skillsResult;
        adminImage = admin?.profile_image || null;
    } catch (error) {
        console.error('Failed to fetch homepage data:', error);
    }

    return (
        <div className="flex flex-col overflow-x-hidden">
            <HeroSection adminImage={adminImage} />
            <SkillsSection skills={allSkills} />
            <RecentProjectsSection />
            <CareerHighlightsSection />
            <RecentBlogsSection />
            <TestimonialsSection />
        </div>
    );
}
