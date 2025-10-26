"use client"

import { useEffect, useState } from "react"
import { apiCall } from "@/lib/fetch"
import type { Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github } from "lucide-react"

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProjects = async () => {
      const response = await apiCall("/public/projects", { method: "GET" })
      if (response.success && response.data) {
        setProjects(response.data)
      }
      setIsLoading(false)
    }

    loadProjects()
  }, [])

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Projects</h1>
      <p className="mt-4 text-lg text-muted-foreground">A selection of my recent work</p>

      {isLoading ? (
        <div className="mt-12 text-center">Loading...</div>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className={project.featured ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span>{project.title}</span>
                  {project.featured && <span className="text-xs font-normal text-primary">Featured</span>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  {project.link && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.link} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </a>
                    </Button>
                  )}
                  {project.github && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={project.github} target="_blank" rel="noopener noreferrer">
                        <Github className="mr-2 h-4 w-4" />
                        Code
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
