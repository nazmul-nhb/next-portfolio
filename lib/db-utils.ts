import { db } from "./db"
import { users, skills, projects, blogPosts, messages, profile } from "./schema"
import { eq, desc } from "drizzle-orm"
import type { Skill, Project, BlogPost, Message, Profile } from "./types"

// User operations
export async function getUserByEmail(email: string) {
  const result = await db.select().from(users).where(eq(users.email, email))
  return result[0] || null
}

export async function getUserById(id: string) {
  const result = await db.select().from(users).where(eq(users.id, id))
  return result[0] || null
}

export async function createUser(data: { email: string; passwordHash: string; name: string }) {
  const result = await db.insert(users).values(data).returning()
  return result[0]
}

// Skill operations
export async function getAllSkills() {
  return db.select().from(skills).orderBy(desc(skills.createdAt))
}

export async function createSkill(data: { name: string; category: string; proficiency: string }) {
  const result = await db.insert(skills).values(data).returning()
  return result[0]
}

export async function updateSkill(id: string, data: Partial<Skill>) {
  const result = await db
    .update(skills)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(skills.id, id))
    .returning()
  return result[0]
}

export async function deleteSkill(id: string) {
  await db.delete(skills).where(eq(skills.id, id))
}

// Project operations
export async function getAllProjects() {
  return db.select().from(projects).orderBy(desc(projects.createdAt))
}

export async function getFeaturedProjects() {
  return db.select().from(projects).where(eq(projects.featured, true)).orderBy(desc(projects.createdAt))
}

export async function createProject(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
  const result = await db.insert(projects).values(data).returning()
  return result[0]
}

export async function updateProject(id: string, data: Partial<Project>) {
  const result = await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, id))
    .returning()
  return result[0]
}

export async function deleteProject(id: string) {
  await db.delete(projects).where(eq(projects.id, id))
}

// Blog operations
export async function getAllBlogPosts() {
  return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt))
}

export async function getPublishedBlogPosts() {
  return db.select().from(blogPosts).where(eq(blogPosts.published, true)).orderBy(desc(blogPosts.createdAt))
}

export async function getBlogPostBySlug(slug: string) {
  const result = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug))
  return result[0] || null
}

export async function createBlogPost(data: Omit<BlogPost, "id" | "createdAt" | "updatedAt">) {
  const result = await db.insert(blogPosts).values(data).returning()
  return result[0]
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>) {
  const result = await db
    .update(blogPosts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(blogPosts.id, id))
    .returning()
  return result[0]
}

export async function deleteBlogPost(id: string) {
  await db.delete(blogPosts).where(eq(blogPosts.id, id))
}

// Message operations
export async function getAllMessages() {
  return db.select().from(messages).orderBy(desc(messages.createdAt))
}

export async function createMessage(data: Omit<Message, "id" | "createdAt">) {
  const result = await db.insert(messages).values(data).returning()
  return result[0]
}

export async function markMessageAsRead(id: string) {
  const result = await db.update(messages).set({ isRead: true }).where(eq(messages.id, id)).returning()
  return result[0]
}

export async function deleteMessage(id: string) {
  await db.delete(messages).where(eq(messages.id, id))
}

// Profile operations
export async function getProfile() {
  const result = await db.select().from(profile).limit(1)
  return result[0] || null
}

export async function updateProfile(data: Partial<Profile>) {
  const existing = await getProfile()
  if (existing) {
    const result = await db
      .update(profile)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(profile.id, existing.id))
      .returning()
    return result[0]
  } else {
    const result = await db
      .insert(profile)
      .values({ ...data, updatedAt: new Date() } as any)
      .returning()
    return result[0]
  }
}
