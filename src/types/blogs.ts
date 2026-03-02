import type { categories } from '@/lib/drizzle/schema';
import type { ReplaceDate } from '@/types';

export interface SingleBlogRes {
    blog: BlogDetails;
    tags: BlogTag[];
    categories: BlogCategory[];
    comments: BlogComment[];
}

export interface BlogComment {
    id: number;
    content: string;
    parent_comment_id: number | null;
    reactions: Record<string, number[]> | null;
    created_at: string;
    updated_at: string;
    author: BlogAuthor;
}

export interface BlogTag {
    id: number;
    title: string;
    slug: string;
}

export interface BlogCategory {
    id: number;
    title: string;
    slug: string;
}

export interface BlogDetails {
    id: number;
    title: string;
    slug: string;
    content: string;
    cover_image: string | null;
    excerpt: string | null;
    is_published: boolean;
    published_date: string | null;
    created_at: string;
    updated_at: string;
    views: number;
    reactions: BLogReactions | null;
    author: BlogAuthor;
}

export interface BlogAuthor {
    id: number;
    name: string;
    profile_image: string | null;
}

export interface BLogReactions {
    like: number[];
    dislike: number[];
}

export type SelectCategory = ReplaceDate<typeof categories.$inferSelect>;

export type RecentBlog = {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    content: string;
    views: number;
    published_date: Date | null;
    author: BlogAuthor;
};

export interface AdminBlog {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    cover_image: string | null;
    is_published: boolean;
    published_date: string | Date | null;
    views: number;
    created_at: string | Date;
    author: {
        id: number;
        name: string;
        email: string;
        profile_image: string | null;
    };
}
