"use client"

import { useEffect, useState } from "react"
import { apiCall } from "@/lib/fetch"
import type { BlogPost } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      const response = await apiCall("/public/blog", { method: "GET" })
      if (response.success && response.data) {
        setPosts(response.data)
      }
      setIsLoading(false)
    }

    loadPosts()
  }, [])

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">Blog</h1>
      <p className="mt-4 text-lg text-muted-foreground">Thoughts, tutorials, and insights</p>

      {isLoading ? (
        <div className="mt-12 text-center">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="mt-12 text-center text-muted-foreground">No blog posts yet</div>
      ) : (
        <div className="mt-12 space-y-6">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader>
                <CardTitle>{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {new Date(post.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{post.excerpt}</p>
                <Link href={`/blog/${post.slug}`}>
                  <Button variant="outline">Read More</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
