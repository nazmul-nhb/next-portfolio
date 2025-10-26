"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/fetch"
import type { Project } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Trash2 } from "lucide-react"

export function ProjectsManager() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    github: "",
    tags: "",
    featured: false,
  })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    const response = await apiCall("/admin/projects", { method: "GET" })
    if (response.success && response.data) {
      setProjects(response.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const response = await apiCall("/admin/projects", {
      method: "POST",
      body: {
        ...formData,
        tags: formData.tags.split(",").map((t) => t.trim()),
      },
    })

    if (response.success) {
      setFormData({
        title: "",
        description: "",
        link: "",
        github: "",
        tags: "",
        featured: false,
      })
      await loadProjects()
    }

    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await apiCall(`/admin/projects/${id}`, { method: "DELETE" })
      await loadProjects()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Project title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Textarea
              placeholder="Project description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Project link (optional)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
              <Input
                placeholder="GitHub link (optional)"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>
            <Input
              placeholder="Tags (comma separated)"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              required
            />
            <div className="flex items-center gap-2">
              <Checkbox
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <label className="text-sm">Featured project</label>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Project"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardContent className="flex items-start justify-between pt-6">
              <div className="flex-1">
                <p className="font-medium">{project.title}</p>
                <p className="text-sm text-muted-foreground">{project.description}</p>
                <div className="mt-2 flex gap-2">
                  {project.tags.map((tag) => (
                    <span key={tag} className="inline-block rounded bg-primary/10 px-2 py-1 text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(project.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
