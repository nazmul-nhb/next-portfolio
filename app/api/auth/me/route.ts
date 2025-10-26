import { getUserById } from "@/lib/db-utils"
import { verifyToken } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"
import { cookies } from "next/headers"

export async function GET(): Promise<Response> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return Response.json(
        {
          success: false,
          error: "Not authenticated",
        } as ApiResponse<null>,
        { status: 401 },
      )
    }

    const payload = await verifyToken(token)

    if (!payload || typeof payload.userId !== "string") {
      return Response.json(
        {
          success: false,
          error: "Invalid token",
        } as ApiResponse<null>,
        { status: 401 },
      )
    }

    const user = await getUserById(payload.userId)

    if (!user) {
      return Response.json(
        {
          success: false,
          error: "User not found",
        } as ApiResponse<null>,
        { status: 404 },
      )
    }

    return Response.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Auth check error:", error)
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<null>,
      { status: 500 },
    )
  }
}
