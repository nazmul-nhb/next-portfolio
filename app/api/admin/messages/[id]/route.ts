import { markMessageAsRead, deleteMessage } from "@/lib/db-utils"
import { verifyToken } from "@/lib/auth"
import type { ApiResponse } from "@/lib/types"
import { cookies } from "next/headers"

async function checkAdminAuth() {
  const cookieStore = await cookies()
  const token = cookieStore.get("auth_token")?.value

  if (!token) {
    return null
  }

  const payload = await verifyToken(token)
  if (!payload || payload.role !== "admin") {
    return null
  }

  return payload
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const auth = await checkAdminAuth()
    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" } as ApiResponse<null>, { status: 401 })
    }

    const { id } = await params
    const message = await markMessageAsRead(id)

    return Response.json({
      success: true,
      data: message,
      message: "Message marked as read",
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Mark message as read error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const auth = await checkAdminAuth()
    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" } as ApiResponse<null>, { status: 401 })
    }

    const { id } = await params
    await deleteMessage(id)

    return Response.json({
      success: true,
      message: "Message deleted successfully",
    } as ApiResponse<null>)
  } catch (error) {
    console.error("[v0] Delete message error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
