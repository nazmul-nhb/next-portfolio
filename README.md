# Portfolio & Blog Site

A modern, full-stack portfolio and blogging platform built with **Next.js 16**, **React 19**, **TailwindCSS**, **Framer Motion** and **Drizzle ORM**. Features a rich admin dashboard, blog editor, project showcase, resume generator, real-time (*almost*) messaging, productivity tools and more.

> This is my personal portfolio and blog site, designed to showcase my projects, skills, experience, and thoughts. It serves as a platform for me to share my work and insights with the world. The code is open-source and can be used as a reference or starting point for your own portfolio or blog projects. However, please note that this project is not licensed for redistribution, so it cannot be used for commercial purposes or shared without permission.

## Live URLs

- [nazmul-nhb.dev](https://nazmul-nhb.dev/)
- [next.nazmul-nhb.dev](https://next.nazmul-nhb.dev/)
- [next-nhb.vercel.app](https://next-nhb.vercel.app/)

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the App](#running-the-app)
- [Scripts](#scripts)
- [License](#license)

---

## Features

- **Portfolio Showcase** — Projects, skills, experience, education & testimonials
- **Blog Platform** — Rich-text editor (Tiptap), categories, tags & comments
- **Admin Dashboard** — Full CRUD for all content types with drag-and-drop sorting
- **Authentication** — Credentials & Google OAuth via NextAuth v5
- **Resume** — Dynamic PDF generation with `@react-pdf/renderer`
- **Contact & Messaging** — Contact form with email notifications, direct messaging between users
- **Theme Switching** — Light/dark mode with `next-themes`
- **Live CLock & Calendar** — Real-time clock and calendar for both Gregorian and Bengali dates
- **Responsive Design** — Mobile-first layout with Tailwind CSS v4
- **Image Uploads** — Cloudinary integration for media management
- **SEO Optimized** — Dynamic OpenGraph images, sitemap, and robots.txt
- **Type Safety** — End-to-end TypeScript with Zod validation and typed routes
- **React Compiler** — Enabled for automatic optimizations
- **Animations** — Smooth transitions with Framer Motion

> The messaging feature is "almost" real-time because it uses a polling mechanism to check for new messages every few seconds. This approach is chosen because Vercel's serverless functions do not support WebSockets or long-lived connections, which are typically required for true real-time communication. While this method may not be as instantaneous as WebSockets, it provides a practical solution for enabling user messaging within the constraints of a serverless environment.

---

## Tech Stack

| Layer                    | Technology                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Framework                | [Next.js 16](https://nextjs.org/) (App Router with React Compiler, Turbopack)                     |
| Language                 | [TypeScript 6](https://www.typescriptlang.org/)                                                   |
| UI                       | [React 19](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/)                        |
| Component Library        | [Radix UI Primitives](https://www.radix-ui.com/), [shadcn](https://ui.shadcn.com/docs/components) |
| State                    | [Zustand](https://zustand.docs.pmnd.rs/), [TanStack Query](https://tanstack.com/query)            |
| Database                 | [Neon](https://neon.tech/) (Serverless PostgreSQL)                                                |
| ORM                      | [Drizzle ORM](https://orm.drizzle.team/)                                                          |
| Auth                     | [NextAuth v5](https://authjs.dev/) (Credentials + Google)                                         |
| Editor                   | [Tiptap](https://tiptap.dev/)                                                                     |
| Forms                    | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)                         |
| Email                    | [Nodemailer](https://nodemailer.com/)                                                             |
| Media                    | [Cloudinary](https://cloudinary.com/)                                                             |
| PDF                      | [@react-pdf/renderer](https://react-pdf.org/)                                                     |
| Utilities & Guards       | [nhb-toolbox](https://tools.nazmul.dev/)                                                          |
| Hooks                    | [nhb-hooks](https://github.com/nazmul-nhb/nhb-hooks)                                              |
| Commit Message Formatter | `nhb-commit` from [nhb-scripts](https://github.com/nazmul-nhb/nhb-scripts)                        |
| Format/Linting           | [Biome](https://biomejs.dev/)                                                                     |
| Package Manager          | [pnpm](https://pnpm.io/)                                                                          |

---

## Project Structure

```ini
src/
├── app/                    # Next.js App Router pages & API routes
│   ├── (home)/             # Landing page (hero, skills, projects, blogs, testimonials)
│   ├── about/              # About page
│   ├── admin/              # Admin dashboard (projects, skills, blogs, etc.)
│   ├── api/                # REST API endpoints
│   ├── auth/               # Login, register, error pages
│   ├── blogs/              # Blog listing, detail, create/edit
│   ├── contact/            # Contact form
│   ├── messages/           # User messaging
│   ├── projects/           # Project listing & detail
│   ├── resume/             # Resume viewer with PDF download
│   ├── settings/           # User settings
│   └── users/              # User profiles
├── components/             # Reusable React components
│   ├── forms/              # Reusable form components (project, skill, blog, etc.)
│   ├── misc/               # Shared UI (footer, loading, animations, tooltips, etc.)
│   ├── nav/                # Navbar, sidebar, mobile nav
│   └── ui/                 # Primitives (button, card, dialog, input, etc.)
├── configs/                # Site config & environment variables
├── lib/                    # Business logic, utilities & services
│   ├── actions/            # Server-side request helpers
│   ├── drizzle/            # Database client & schema definitions
│   ├── email/              # Email service & templates
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand stores
│   └── zod-schema/         # Zod validation schemas
├── providers/              # Context providers (auth, query, theme)
└── types/                  # TypeScript type definitions
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 22 (24 recommended)
- **pnpm** ≥ 10
- A **Neon** PostgreSQL database (or any PostgreSQL instance: needs customization)
- **Cloudinary** account for image uploads
- **Google Cloud** OAuth credentials (optional, for Google sign-in & email services)

### Installation

```bash
git clone https://github.com/nazmul-nhb/next-portfolio.git
cd next-portfolio
pnpm install
```

### Environment Variables

Create a `.env.local` or `.env` file in the project root with the following variables:

```env
# App
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your-auth-secret
JWT_SECRET=your-jwt-secret
NEXT_PUBLIC_CIPHER_SECRET=your-cipher-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email
EMAIL_ADDRESS=your-email@example.com
EMAIL_PASSWORD=your-app-password

# Admin
NEXT_PUBLIC_ADMIN_EMAIL=admin@example.com

# Cloudinary
NEXT_PUBLIC_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_API_SECRET=your-api-secret
NEXT_PUBLIC_CLOUDINARY_IMAGE_BASE_URL=https://res.cloudinary.com/<your-cloud>/image/upload/
NEXT_PUBLIC_CLOUDINARY_IMAGE_UPLOAD_URL=https://api.cloudinary.com/v1_1/<your-cloud>/image/upload

# Resume
NEXT_PUBLIC_RESUME_PDF_URL=https://link-to-your-resume.pdf
```

### Database Setup

Generate and run migrations:

```bash
pnpm gen       # Generate migration files
pnpm migrate   # Apply migrations to the database
```

### Running the App

```bash
pnpm dev       # Start development server (http://localhost:3000)
pnpm build     # Create production build
pnpm start     # Start production server
```

---

## Scripts

>There are several npm scripts available for development and maintenance. The most commonly used ones are listed below:

| Command          | Description                      |
| ---------------- | -------------------------------- |
| `pnpm dev`       | Start development server         |
| `pnpm build`     | Create production build          |
| `pnpm start`     | Start production server          |
| `pnpm clean`     | Remove `.next` build cache       |
| `pnpm lint`      | Run Biome linter                 |
| `pnpm fix`       | Auto-fix lint & format issues    |
| `pnpm format`    | Format code with Biome           |
| `pnpm typecheck` | Run TypeScript type checking     |
| `pnpm gen`       | Generate Drizzle migrations      |
| `pnpm migrate`   | Apply database migrations        |
| `pnpm push`      | Push schema directly to database |
| `pnpm studio`    | Open Drizzle Studio (DB GUI)     |

---

## License

This project is private and not licensed for redistribution.
