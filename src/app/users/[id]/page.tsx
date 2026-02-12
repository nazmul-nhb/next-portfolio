import { and, desc, eq } from 'drizzle-orm';
import { Calendar, PenTool, Shield } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FadeInUp, ScaleInItem, StaggerContainer } from '@/components/misc/animations';
import { db } from '@/lib/drizzle';
import { blogs } from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';

interface Props {
    params: Promise<{ id: string }>;
}

/** Generate metadata for user profile page. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    try {
        const [user] = await db
            .select({ name: users.name, bio: users.bio })
            .from(users)
            .where(eq(users.id, Number(id)))
            .limit(1);

        if (!user) return { title: 'User Not Found' };

        return {
            title: user.name,
            description: user.bio || `Profile of ${user.name}`,
        };
    } catch (error) {
        console.error('Failed to fetch user metadata:', error);
        return { title: 'User Profile' };
    }
}

/** Public user profile page. */
export default async function UserProfilePage({ params }: Props) {
    const { id } = await params;

    let user:
        | {
              id: number;
              name: string;
              profile_image: string | null;
              bio: string | null;
              role: 'admin' | 'user';
              created_at: Date;
          }
        | undefined;
    let userBlogs: {
        id: number;
        title: string;
        slug: string;
        excerpt: string | null;
        cover_image: string | null;
        published_date: Date | null;
        views: number;
    }[] = [];

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
            .where(eq(users.id, Number(id)))
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
    } catch (error) {
        console.error('Failed to fetch user blogs:', error);
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-12">
            {/* Profile header */}
            <FadeInUp>
                <div className="mb-12 flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:gap-8">
                    <div className="mb-4 sm:mb-0">
                        {user.profile_image ? (
                            <Image
                                alt={user.name}
                                className="h-28 w-28 rounded-full border-4 border-primary/20 object-cover"
                                height={112}
                                src={user.profile_image}
                                width={112}
                            />
                        ) : (
                            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-linear-to-br from-blue-500/30 to-violet-500/30 text-4xl font-bold text-primary">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            {user.role === 'admin' && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600">
                                    <Shield className="h-3 w-3" />
                                    Admin
                                </span>
                            )}
                        </div>
                        {user.bio && <p className="mb-3 text-muted-foreground">{user.bio}</p>}
                        <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground sm:justify-start">
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                Joined{' '}
                                {new Date(user.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    year: 'numeric',
                                })}
                            </span>
                            <span className="flex items-center gap-1">
                                <PenTool className="h-3.5 w-3.5" />
                                {userBlogs.length} post{userBlogs.length !== 1 ? 's' : ''}
                            </span>
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
                        <p className="py-12 text-center text-muted-foreground">
                            No published posts yet.
                        </p>
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
                                                src={post.cover_image}
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
                                                        {new Date(
                                                            post.published_date
                                                        ).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                )}
                                                <span>{post.views} views</span>
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
