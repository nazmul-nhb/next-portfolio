import { eq } from 'drizzle-orm';
import {
    Briefcase,
    FolderKanban,
    GraduationCap,
    Lightbulb,
    MessageCircle,
    MessageSquareQuote,
    Newspaper,
    Tag,
    Users,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/lib/drizzle';
import {
    blogs,
    categories,
    contactMessages,
    education,
    experiences,
    projects,
    skills,
    testimonials,
    users,
} from '@/lib/drizzle/schema';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    let stats = {
        projects: 0,
        skills: 0,
        experience: 0,
        education: 0,
        testimonials: 0,
        users: 0,
        messages: 0,
        blogs: 0,
        categories: 0,
    };

    try {
        const [
            projectsCount,
            skillsCount,
            experienceCount,
            educationCount,
            testimonialsCount,
            usersCount,
            messagesCount,
            blogsCount,
            categoriesCount,
        ] = await Promise.all([
            db.select({ id: projects.id }).from(projects),
            db.select({ id: skills.id }).from(skills),
            db.select({ id: experiences.id }).from(experiences),
            db.select({ id: education.id }).from(education),
            db.select({ id: testimonials.id }).from(testimonials),
            db.select({ id: users.id }).from(users),
            db
                .select({ id: contactMessages.id })
                .from(contactMessages)
                .where(eq(contactMessages.is_read, false)),
            db.select({ id: blogs.id }).from(blogs),
            db.select({ id: categories.id }).from(categories),
        ]);

        stats = {
            projects: projectsCount.length,
            skills: skillsCount.length,
            experience: experienceCount.length,
            education: educationCount.length,
            testimonials: testimonialsCount.length,
            users: usersCount.length,
            messages: messagesCount.length,
            blogs: blogsCount.length,
            categories: categoriesCount.length,
        };
    } catch (error) {
        console.error('Error fetching admin stats:', error);
    }

    const cards = [
        {
            title: 'Projects',
            count: stats.projects,
            icon: FolderKanban,
            href: '/admin/projects',
            color: 'text-blue-600',
        },
        {
            title: 'Skills',
            count: stats.skills,
            icon: Lightbulb,
            href: '/admin/skills',
            color: 'text-yellow-600',
        },
        {
            title: 'Experience',
            count: stats.experience,
            icon: Briefcase,
            href: '/admin/experience',
            color: 'text-cyan-600',
        },
        {
            title: 'Education',
            count: stats.education,
            icon: GraduationCap,
            href: '/admin/education',
            color: 'text-indigo-600',
        },
        {
            title: 'Testimonials',
            count: stats.testimonials,
            icon: MessageSquareQuote,
            href: '/admin/testimonials',
            color: 'text-pink-600',
        },
        {
            title: 'New Messages',
            count: stats.messages,
            icon: MessageCircle,
            href: '/admin/messages',
            color: 'text-purple-600',
        },
        {
            title: 'Users',
            count: stats.users,
            icon: Users,
            href: '/admin/users',
            color: 'text-green-600',
        },
        {
            title: 'Blogs',
            count: stats.blogs,
            icon: Newspaper,
            href: '/admin/blogs',
            color: 'text-teal-600',
        },
        {
            title: 'Blog Categories',
            count: stats.categories,
            icon: Tag,
            href: '/admin/categories',
            color: 'text-orange-600',
        },
    ];

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome back! Here&apos;s an overview of your portfolio.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                    <Link
                        className="rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                        href={'/admin/projects/new'}
                    >
                        <h3 className="font-semibold">Add New Project</h3>
                        <p className="text-sm text-muted-foreground">
                            Create a new portfolio project
                        </p>
                    </Link>
                    <Link
                        className="rounded-lg border border-border p-4 transition-colors hover:bg-accent"
                        href={'/admin/skills/new'}
                    >
                        <h3 className="font-semibold">Add New Skill</h3>
                        <p className="text-sm text-muted-foreground">
                            Add a skill to your profile
                        </p>
                    </Link>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {cards.map((card) => (
                    <Link href={card.href as '/'} key={card.title}>
                        <Card className="transition-shadow hover:shadow-lg">
                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <card.icon className={`h-5 w-5 ${card.color}`} />
                            </CardHeader>
                            <CardContent>
                                <div className="text-3xl font-bold">{card.count}</div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
