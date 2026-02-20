import type { categories } from '@/lib/drizzle/schema';

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
    published_date: Date | null;
    views: number;
    reactions: Record<string, number[]> | null;
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

export type SelectCategory = typeof categories.$inferSelect;
