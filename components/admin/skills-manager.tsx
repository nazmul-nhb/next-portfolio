"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/fetch"
import type { Skill } from "@/lib/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2 } from "lucide-react"

export function SkillsManager() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    proficiency: "intermediate" as const,
  })

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    const response = await apiCall("/admin/skills", { method: "GET" })
    if (response.success && response.data) {
      setSkills(response.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const response = await apiCall("/admin/skills", {
      method: "POST",
      body: formData,
    })

    if (response.success) {
      setFormData({ name: "", category: "", proficiency: "intermediate" })
      await loadSkills()
    }

    setIsLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await apiCall(`/admin/skills/${id}`, { method: "DELETE" })
      await loadSkills()
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Skill</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Skill name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <Input
                placeholder="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              />
              <Select
                value={formData.proficiency}
                onValueChange={(value: any) => setFormData({ ...formData, proficiency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Skill"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {skills.map((skill) => (
          <Card key={skill.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div>
                <p className="font-medium">{skill.name}</p>
                <p className="text-sm text-muted-foreground">
                  {skill.category} • {skill.proficiency}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(skill.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
