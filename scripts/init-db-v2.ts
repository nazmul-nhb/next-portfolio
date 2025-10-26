import { db } from "../lib/db"
import { users, profile } from "../lib/schema"
import { hashPassword } from "../lib/password"

async function initializeDatabase() {
  try {
    console.log("[v0] Initializing database with Drizzle schema...")

    // Create admin user
    const adminEmail = "admin@portfolio.com"
    const existingAdmin = await db
      .select()
      .from(users)
      .where((u) => u.email === adminEmail)

    if (existingAdmin.length === 0) {
      const hashedPassword = await hashPassword("admin123")
      await db.insert(users).values({
        email: adminEmail,
        passwordHash: hashedPassword,
        name: "Admin",
        role: "admin",
        bio: "Portfolio Administrator",
      })
      console.log("[v0] Admin user created: admin@portfolio.com")
    }

    // Create sample profile
    const existingProfile = await db.select().from(profile).limit(1)
    if (existingProfile.length === 0) {
      await db.insert(profile).values({
        name: "Your Name",
        title: "Full Stack Developer",
        bio: "Passionate about building beautiful and functional web experiences.",
        email: "your.email@example.com",
        socialLinks: {
          github: "https://github.com",
          linkedin: "https://linkedin.com",
          twitter: "https://twitter.com",
        },
      })
      console.log("[v0] Sample profile created")
    }

    console.log("[v0] Database initialized successfully!")
  } catch (error) {
    console.error("[v0] Failed to initialize database:", error)
    process.exit(1)
  }
}

initializeDatabase()
