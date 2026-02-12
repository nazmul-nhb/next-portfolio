import { eq } from 'drizzle-orm';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/drizzle';
import {
    blogCategories,
    blogs,
    blogTags,
    categories,
    comments,
    tags,
} from '@/lib/drizzle/schema/blogs';
import { users } from '@/lib/drizzle/schema/users';
import { BlogContent } from './_components/BlogContent';
import { CommentSection } from './_components/CommentSection';

interface BlogPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
    const { slug } = await params;

    try {
        const [blog] = await db
            .select({
                title: blogs.title,
                excerpt: blogs.excerpt,
                cover_image: blogs.cover_image,
            })
            .from(blogs)
            .where(eq(blogs.slug, slug))
            .limit(1);

        if (!blog) return { title: 'Blog Not Found' };

        return {
            title: blog.title,
            description: blog.excerpt || undefined,
            openGraph: {
                title: blog.title,
                description: blog.excerpt || undefined,
                ...(blog.cover_image && { images: [blog.cover_image] }),
            },
        };
    } catch (error) {
        console.error('Failed to fetch blog metadata:', error);
        return { title: 'Blog' };
    }
}

export default async function BlogPostPage({ params }: BlogPageProps) {
    const { slug } = await params;

    try {
        const [blog] = await db
            .select({
                id: blogs.id,
                title: blogs.title,
                slug: blogs.slug,
                content: blogs.content,
                cover_image: blogs.cover_image,
                excerpt: blogs.excerpt,
                is_published: blogs.is_published,
                published_date: blogs.published_date,
                views: blogs.views,
                reactions: blogs.reactions,
                created_at: blogs.created_at,
                author: {
                    id: users.id,
                    name: users.name,
                    profile_image: users.profile_image,
                    bio: users.bio,
                },
            })
            .from(blogs)
            .innerJoin(users, eq(blogs.author_id, users.id))
            .where(eq(blogs.slug, slug))
            .limit(1);

        if (!blog || !blog.is_published) notFound();

        // Fetch tags, categories, comments
        const [blogTagList, blogCategoryList, blogComments] = await Promise.all([
            db
                .select({ id: tags.id, title: tags.title, slug: tags.slug })
                .from(blogTags)
                .innerJoin(tags, eq(blogTags.tag_id, tags.id))
                .where(eq(blogTags.blog_id, blog.id)),
            db
                .select({ id: categories.id, title: categories.title, slug: categories.slug })
                .from(blogCategories)
                .innerJoin(categories, eq(blogCategories.category_id, categories.id))
                .where(eq(blogCategories.blog_id, blog.id)),
            db
                .select({
                    id: comments.id,
                    content: comments.content,
                    parent_comment_id: comments.parent_comment_id,
                    reactions: comments.reactions,
                    created_at: comments.created_at,
                    author: {
                        id: users.id,
                        name: users.name,
                        profile_image: users.profile_image,
                    },
                })
                .from(comments)
                .innerJoin(users, eq(comments.author_id, users.id))
                .where(eq(comments.blog_id, blog.id)),
        ]);

        return (
            <article className="mx-auto max-w-4xl px-4 py-12">
                <BlogContent blog={blog} categories={blogCategoryList} tags={blogTagList} />
                <CommentSection blogId={blog.id} comments={blogComments} />
            </article>
        );
    } catch (error) {
        console.error('Failed to fetch blog post:', error);
        notFound();
    }
}
