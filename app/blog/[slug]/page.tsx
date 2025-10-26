"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiCall } from "@/lib/fetch"
import type { BlogPost } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string
  const [post, setPost] = useState<BlogPost | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPost = async () => {
      const response = await apiCall(`/public/blog/${slug}`, { method: "GET" })
      if (response.success && response.data) {
        setPost(response.data)
      }
      setIsLoading(false)
    }

    loadPost()
  }, [slug])

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-center text-muted-foreground">Post not found</p>
        <div className="mt-4 text-center">
          <Link href="/blog">
            <Button variant="outline">
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link href="/blog">
        <Button variant="ghost" className="mb-6">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Blog
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{post.title}</CardTitle>
          <p className="mt-2 text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </CardHeader>
        <CardContent className="prose prose-invert max-w-none">
          <div className="whitespace-pre-wrap text-foreground">{post.content}</div>
        </CardContent>
      </Card>
    </div>
  )
}
