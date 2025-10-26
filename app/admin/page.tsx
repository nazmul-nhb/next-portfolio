"use client"

import { useAuthStore } from "@/lib/store"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SkillsManager } from "@/components/admin/skills-manager"
import { ProjectsManager } from "@/components/admin/projects-manager"
import { ProfileManager } from "@/components/admin/profile-manager"
import { MessagesManager } from "@/components/admin/messages-manager"

export default function AdminPage() {
  const { user } = useAuthStore()
  const router = useRouter()

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.push("/")
    }
  }, [user, router])

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-muted-foreground">Manage your portfolio content</p>

      <Tabs defaultValue="profile" className="mt-8">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileManager />
        </TabsContent>

        <TabsContent value="skills" className="mt-6">
          <SkillsManager />
        </TabsContent>

        <TabsContent value="projects" className="mt-6">
          <ProjectsManager />
        </TabsContent>

        <TabsContent value="messages" className="mt-6">
          <MessagesManager />
        </TabsContent>
      </Tabs>
    </div>
  )
}
