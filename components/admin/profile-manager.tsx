"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { apiCall } from "@/lib/fetch"
import type { Profile } from "@/lib/types"
import { ImageUpload } from "@/components/image-upload"

export function ProfileManager() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    email: "",
    phone: "",
    location: "",
    avatar: "",
    socialLinks: {} as Record<string, string>,
  })

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    const response = await apiCall("/admin/profile", { method: "GET" })
    if (response.success && response.data) {
      setProfile(response.data)
      setFormData(response.data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const response = await apiCall("/admin/profile", {
      method: "PUT",
      body: formData,
    })

    if (response.success) {
      await loadProfile()
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">Avatar</label>
            <ImageUpload value={formData.avatar} onUpload={(url) => setFormData({ ...formData, avatar: url })} />
          </div>
          <Input
            placeholder="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            placeholder="Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Bio"
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            required
          />
          <Input
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <Input
            placeholder="Phone (optional)"
            value={formData.phone || ""}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            placeholder="Location (optional)"
            value={formData.location || ""}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <div className="space-y-2">
            <label className="text-sm font-medium">Social Links</label>
            <Input
              placeholder="GitHub URL"
              value={formData.socialLinks?.github || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, github: e.target.value },
                })
              }
            />
            <Input
              placeholder="LinkedIn URL"
              value={formData.socialLinks?.linkedin || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                })
              }
            />
            <Input
              placeholder="Twitter URL"
              value={formData.socialLinks?.twitter || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, twitter: e.target.value },
                })
              }
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
