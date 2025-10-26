import { z } from "zod"

// Auth Schemas
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
})

// Skill Schema
export const skillSchema = z.object({
  name: z.string().min(1, "Skill name is required"),
  category: z.string().min(1, "Category is required"),
  proficiency: z.enum(["beginner", "intermediate", "advanced", "expert"]),
})

// Project Schema
export const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  link: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).min(1, "At least one tag is required"),
  featured: z.boolean().default(false),
})

// Blog Schema
export const blogSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  excerpt: z.string().min(10, "Excerpt must be at least 10 characters"),
  published: z.boolean().default(false),
})

// Message Schema
export const messageSchema = z.object({
  senderName: z.string().min(1, "Name is required"),
  senderEmail: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(10, "Message must be at least 10 characters"),
})

// Profile Schema
export const profileSchema = z.object({
  name: z.string().min(1, "Name is required"),
  title: z.string().min(1, "Title is required"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  location: z.string().optional(),
  socialLinks: z.record(z.string()).default({}),
})
