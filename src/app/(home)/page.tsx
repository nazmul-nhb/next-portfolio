import type { Metadata } from 'next';
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

export default function HomePage() {
    return (
        <div className="flex flex-col">
            <HeroSection />
            <SkillsSection />
            <RecentProjectsSection />
            <RecentBlogsSection />
            <TestimonialsSection />
        </div>
    );
}
