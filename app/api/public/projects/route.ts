import { getAllProjects, getFeaturedProjects } from "@/lib/db-utils"
import type { ApiResponse } from "@/lib/types"

export async function GET(req: Request): Promise<Response> {
  try {
    const { searchParams } = new URL(req.url)
    const featured = searchParams.get("featured") === "true"

    const projects = featured ? await getFeaturedProjects() : await getAllProjects()

    return Response.json({
      success: true,
      data: projects,
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Get projects error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
