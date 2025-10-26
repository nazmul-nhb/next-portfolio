import { getProfile } from "@/lib/db-utils"
import type { ApiResponse } from "@/lib/types"

export async function GET(): Promise<Response> {
  try {
    const profile = await getProfile()
    return Response.json({
      success: true,
      data: profile,
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Get profile error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
