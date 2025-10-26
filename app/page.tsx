import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 md:gap-8 lg:gap-12">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">Welcome to My Portfolio</h1>
            <p className="mt-6 text-lg text-muted-foreground">
              I'm a full-stack developer passionate about building beautiful and functional web experiences.
            </p>
            <div className="mt-8 flex gap-4">
              <Link href="/projects">
                <Button size="lg">View My Work</Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="h-64 w-64 rounded-lg bg-gradient-to-br from-primary to-accent" />
          </div>
        </div>
      </section>

      {/* Skills Preview */}
      <section className="border-t border-border bg-card py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">Skills</h2>
          <p className="mt-4 text-muted-foreground">Check out my skills and expertise</p>
          <Link href="/skills" className="mt-8 inline-block">
            <Button variant="outline">View All Skills</Button>
          </Link>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold">Featured Projects</h2>
        <p className="mt-4 text-muted-foreground">Some of my recent work</p>
        <Link href="/projects" className="mt-8 inline-block">
          <Button variant="outline">View All Projects</Button>
        </Link>
      </section>
    </div>
  )
}
