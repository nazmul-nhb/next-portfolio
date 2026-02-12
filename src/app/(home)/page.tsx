import type { Metadata } from 'next';
import { db } from '@/lib/drizzle';
import { skills } from '@/lib/drizzle/schema/skills';
import { HeroSection } from './_components/HeroSection';
import { RecentBlogsSection } from './_components/RecentBlogs';
import { RecentProjectsSection } from './_components/RecentProjects';
import { SkillsSection } from './_components/SkillsSection';
import { TestimonialsSection } from './_components/Testimonials';

export const revalidate = 3600; // ISR: revalidate every hour

export const metadata: Metadata = {
    title: 'Nazmul Hassan | Full-Stack Web Developer',
    description:
        'Full-Stack Web Developer passionate about building modern, performant, and accessible web applications.',
};

export default async function HomePage() {
    let allSkills: (typeof skills.$inferSelect)[] = [];

    try {
        allSkills = await db.select().from(skills);
    } catch (error) {
        console.error('Failed to fetch skills:', error);
    }

    return (
        <div className="flex flex-col">
            <HeroSection />
            <SkillsSection skills={allSkills} />
            <RecentProjectsSection />
            <RecentBlogsSection />
            <TestimonialsSection />
        </div>
    );
}
