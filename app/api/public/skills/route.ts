import { getAllSkills } from "@/lib/db-utils"
import type { ApiResponse } from "@/lib/types"

export async function GET(): Promise<Response> {
  try {
    const skills = await getAllSkills()
    return Response.json({
      success: true,
      data: skills,
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Get skills error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
