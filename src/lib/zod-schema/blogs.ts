import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { blogs, categories, comments, tags } from '@/lib/drizzle/schema/blogs';

/** Schema for creating a blog post. */
export const CreateBlogSchema = createInsertSchema(blogs)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        slug: true,
        author_id: true,
        views: true,
        reactions: true,
        published_date: true,
    })
    .extend({
        title: z
            .string()
            .min(3, 'Title must be at least 3 characters')
            .max(256, 'Title must be at most 256 characters'),
        content: z.string().min(10, 'Content must be at least 10 characters'),
        cover_image: z.url('Must be a valid URL').optional(),
        excerpt: z.string().max(500, 'Excerpt must be at most 500 characters').optional(),
        is_published: z.boolean().default(false),
        tag_ids: z.array(z.number()).optional(),
        category_ids: z.array(z.number()).optional(),
    })
    .strict();

/** Schema for updating a blog post. */
export const UpdateBlogSchema = CreateBlogSchema.partial();

/** Schema for creating a comment. */
export const CreateCommentSchema = createInsertSchema(comments)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        author_id: true,
        reactions: true,
    })
    .extend({
        content: z.string().min(1, 'Comment cannot be empty').max(2000, 'Comment is too long'),
        blog_id: z.number(),
        parent_comment_id: z.number().optional(),
    })
    .strict();

/** Schema for creating a tag. */
export const CreateTagSchema = createInsertSchema(tags)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        slug: true,
    })
    .extend({
        title: z
            .string()
            .min(1, 'Tag name is required')
            .max(64, 'Tag name must be at most 64 characters'),
    })
    .strict();

/** Schema for creating a category. */
export const CreateCategorySchema = createInsertSchema(categories)
    .omit({
        id: true,
        created_at: true,
        updated_at: true,
        slug: true,
    })
    .extend({
        title: z
            .string()
            .min(1, 'Category name is required')
            .max(128, 'Category name must be at most 128 characters'),
    })
    .strict();
