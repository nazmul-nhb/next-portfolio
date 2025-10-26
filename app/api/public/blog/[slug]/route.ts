import { getBlogPostBySlug } from "@/lib/db-utils"
import type { ApiResponse } from "@/lib/types"

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }): Promise<Response> {
  try {
    const { slug } = await params
    const post = await getBlogPostBySlug(slug)

    if (!post) {
      return Response.json({ success: false, error: "Post not found" } as ApiResponse<null>, { status: 404 })
    }

    return Response.json({
      success: true,
      data: post,
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Get blog post error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
