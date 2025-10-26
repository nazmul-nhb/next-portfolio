import { getPublishedBlogPosts } from "@/lib/db-utils"
import type { ApiResponse } from "@/lib/types"

export async function GET(): Promise<Response> {
  try {
    const posts = await getPublishedBlogPosts()
    return Response.json({
      success: true,
      data: posts,
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Get blog posts error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
