"use client"

import { useEffect, useState } from "react"
import { apiCall } from "@/lib/fetch"
import type { Skill } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadSkills = async () => {
      const response = await apiCall("/public/skills", { method: "GET" })
      if (response.success && response.data) {
        setSkills(response.data)
      }
      setIsLoading(false)
    }

    loadSkills()
  }, [])

  const groupedSkills = skills.reduce(
    (acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = []
      }
      acc[skill.category].push(skill)
      return acc
    },
    {} as Record<string, Skill[]>,
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Skills & Expertise</h1>
      <p className="mt-4 text-lg text-muted-foreground">Technologies and skills I've mastered</p>

      {isLoading ? (
        <div className="mt-12 text-center">Loading...</div>
      ) : (
        <div className="mt-12 space-y-8">
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category}>
              <h2 className="mb-4 text-2xl font-semibold">{category}</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {categorySkills.map((skill) => (
                  <Card key={skill.id}>
                    <CardContent className="pt-6">
                      <p className="font-medium">{skill.name}</p>
                      <p className="mt-2 text-sm text-muted-foreground capitalize">{skill.proficiency}</p>
                      <div className="mt-3 h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary"
                          style={{
                            width: {
                              beginner: "25%",
                              intermediate: "50%",
                              advanced: "75%",
                              expert: "100%",
                            }[skill.proficiency],
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
