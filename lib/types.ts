// User & Auth Types
export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface AuthPayload {
  email: string
  password: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  token?: string
  error?: string
}

// Skills
export interface Skill {
  id: string
  name: string
  category: string
  proficiency: "beginner" | "intermediate" | "advanced" | "expert"
  createdAt: Date
  updatedAt: Date
}

export interface CreateSkillPayload {
  name: string
  category: string
  proficiency: "beginner" | "intermediate" | "advanced" | "expert"
}

// Projects
export interface Project {
  id: string
  title: string
  description: string
  image?: string
  link?: string
  github?: string
  tags: string[]
  featured: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProjectPayload {
  title: string
  description: string
  link?: string
  github?: string
  tags: string[]
  featured: boolean
}

// Blog Posts
export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  image?: string
  published: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateBlogPayload {
  title: string
  content: string
  excerpt: string
  published: boolean
}

// Messages
export interface Message {
  id: string
  senderId: string
  senderName: string
  senderEmail: string
  subject: string
  content: string
  isRead: boolean
  createdAt: Date
}

export interface CreateMessagePayload {
  senderName: string
  senderEmail: string
  subject: string
  content: string
}

// Profile
export interface Profile {
  id: string
  name: string
  title: string
  bio: string
  avatar?: string
  email: string
  phone?: string
  location?: string
  socialLinks: Record<string, string>
  updatedAt: Date
}

export interface UpdateProfilePayload {
  name: string
  title: string
  bio: string
  email: string
  phone?: string
  location?: string
  socialLinks: Record<string, string>
}

// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}
