import { and, count, desc, eq } from 'drizzle-orm';
import { Calendar, Eye, FileText, PenTool, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatDate } from 'nhb-toolbox';
import MessageButton from '@/app/users/[id]/_components/MessageButton';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/misc/animations';
import UserAvatar from '@/components/misc/user-avatar';
import { Badge } from '@/components/ui/badge';
import { siteConfig } from '@/configs/site';
import { db } from '@/lib/drizzle';
import { blogs, comments } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import { buildCloudinaryUrl, buildOpenGraphImages } from '@/lib/utils';
import type { UserRole } from '@/types';

/** Generate metadata for user profile page. */
export async function generateMetadata({
    params,
}: PageProps<'/users/[id]'>): Promise<Metadata> {
    const { id } = await params;

    try {
        const [user] = await db
            .select({ name: users.name, bio: users.bio, profile_image: users.profile_image })
            .from(users)
            .where(eq(users.id, +id))
            .limit(1);

        if (!user) return { title: 'User Not Found' };

        return {
            title: user.name,
            description: user.bio || `Profile of ${user.name}`,
            authors: [{ name: siteConfig.name, url: siteConfig.baseUrl }],
            icons: {
                icon: siteConfig.favicon,
                shortcut: siteConfig.favicon,
            },
            openGraph: {
                title: user.name,
                description: user.bio || `Profile of ${user.name}`,
                images: buildOpenGraphImages(
                    user.profile_image && buildCloudinaryUrl(user.profile_image),
                    siteConfig.logoSvg,
                    siteConfig.favicon
                ),
            },
        };
    } catch (error) {
        console.error('Failed to fetch user metadata:', error);
        return { title: 'User Profile' };
    }
}

type UserProfile = {
    id: number;
    name: string;
    profile_image: string | null;
    bio: string | null;
    role: UserRole;
    created_at: Date;
};

type UserBlog = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    published_date: Date | null;
    views: number;
};

/** Public user profile page. */
export default async function UserProfilePage({ params }: PageProps<'/users/[id]'>) {
    const { id } = await params;

    let user: UserProfile | undefined;
    let userBlogs: UserBlog[] = [];
    let totalViews = 0;
    let commentCount = 0;

    try {
        [user] = await db
            .select({
                id: users.id,
                name: users.name,
                profile_image: users.profile_image,
                bio: users.bio,
                role: users.role,
                created_at: users.created_at,
            })
            .from(users)
            .where(eq(users.id, +id))
            .limit(1);
    } catch (error) {
        console.error('Failed to fetch user:', error);
    }

    if (!user) notFound();

    try {
        userBlogs = await db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                excerpt: blogs.excerpt,
                cover_image: blogs.cover_image,
                published_date: blogs.published_date,
                views: blogs.views,
            })
            .from(blogs)
            .where(and(eq(blogs.author_id, user.id), eq(blogs.is_published, true)))
            .orderBy(desc(blogs.published_date))
            .limit(10);

        totalViews = userBlogs.reduce((sum, post) => sum + post.views, 0);
    } catch (error) {
        console.error('Failed to fetch user blogs:', error);
    }

    try {
        const [result] = await db
            .select({ count: count() })
            .from(comments)
            .where(eq(comments.author_id, user.id));
        commentCount = result?.count ?? 0;
    } catch (error) {
        console.error('Failed to fetch comment count:', error);
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            {/* Profile header card */}
            <FadeInUp>
                <div className="mb-8 rounded-2xl border border-border/50 bg-card p-6 shadow-sm sm:p-8">
                    <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-8">
                        <div className="mb-4 sm:mb-0">
                            <UserAvatar
                                className="size-28 border-4 border-primary/20 shadow-lg"
                                image={user.profile_image}
                                name={user.name}
                            />
                        </div>
                        <div className="flex-1">
                            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                                <h1 className="text-2xl md:text-3xl font-bold">{user.name}</h1>
                                {user.role === 'admin' && (
                                    <Badge
                                        className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-400"
                                        variant="outline"
                                    >
                                        <Shield className="h-3 w-3" />
                                        Admin
                                    </Badge>
                                )}
                            </div>

                            {user.bio && (
                                <p className="mb-4 max-w-lg text-muted-foreground">
                                    {user.bio}
                                </p>
                            )}

                            <div className="mb-4 flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                                <span className="flex items-center gap-1.5">
                                    <Calendar className="h-3.5 w-3.5" />
                                    Joined{' '}
                                    {formatDate({
                                        date: user.created_at,
                                        format: 'mmm DD, yyyy',
                                    })}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <PenTool className="h-3.5 w-3.5" />
                                    {userBlogs.length} post{userBlogs.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {/* Message button */}
                            <MessageButton userId={user.id} userName={user.name} />
                        </div>
                    </div>

                    {/* Stats row */}
                    <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border/40 pt-6">
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 text-lg font-bold">
                                <FileText className="h-4 w-4 text-primary" />
                                {userBlogs.length}
                            </div>
                            <span className="text-xs text-muted-foreground">Posts</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 text-lg font-bold">
                                <Eye className="h-4 w-4 text-primary" />
                                {totalViews}
                            </div>
                            <span className="text-xs text-muted-foreground">Total views</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <div className="flex items-center gap-1.5 text-lg font-bold">
                                <PenTool className="h-4 w-4 text-primary" />
                                {commentCount}
                            </div>
                            <span className="text-xs text-muted-foreground">Comments</span>
                        </div>
                    </div>
                </div>
            </FadeInUp>

            {/* Blog posts */}
            <section>
                <FadeInUp>
                    <h2 className="mb-6 text-xl font-bold">Posts by {user.name}</h2>
                </FadeInUp>

                {userBlogs.length === 0 ? (
                    <FadeInUp>
                        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 py-16">
                            <FileText className="mb-3 h-10 w-10 text-muted-foreground/40" />
                            <p className="text-muted-foreground">No published posts yet.</p>
                        </div>
                    </FadeInUp>
                ) : (
                    <StaggerContainer className="space-y-4">
                        {userBlogs.map((post) => (
                            <ScaleInItem key={post.id}>
                                <Link href={`/blogs/${post.slug}`}>
                                    <article className="flex gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all hover:shadow-md">
                                        {post.cover_image && (
                                            <Image
                                                alt={post.title}
                                                className="hidden h-20 w-28 shrink-0 rounded-lg object-cover sm:block"
                                                height={80}
                                                src={buildCloudinaryUrl(post.cover_image)}
                                                width={112}
                                            />
                                        )}
                                        <div className="flex-1">
                                            <h3 className="mb-1 font-semibold leading-snug">
                                                {post.title}
                                            </h3>
                                            {post.excerpt && (
                                                <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                                                    {post.excerpt}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                {post.published_date && (
                                                    <span>
                                                        {formatDate({
                                                            date: post.published_date,
                                                            format: 'mmm DD, yyyy',
                                                        })}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Eye className="h-3 w-3" />
                                                    {post.views}
                                                </span>
                                            </div>
                                        </div>
                                    </article>
                                </Link>
                            </ScaleInItem>
                        ))}
                    </StaggerContainer>
                )}
            </section>
        </div>
    );
}
