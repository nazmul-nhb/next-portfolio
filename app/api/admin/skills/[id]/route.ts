import { updateSkill, deleteSkill } from "@/lib/db-utils"
import { skillSchema } from "@/lib/validations"
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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  try {
    const auth = await checkAdminAuth()
    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" } as ApiResponse<null>, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()
    const validation = skillSchema.partial().safeParse(body)

    if (!validation.success) {
      return Response.json({ success: false, error: validation.error.errors[0].message } as ApiResponse<null>, {
        status: 400,
      })
    }

    const skill = await updateSkill(id, validation.data)
    return Response.json({
      success: true,
      data: skill,
      message: "Skill updated successfully",
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Update skill error:", error)
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
    await deleteSkill(id)

    return Response.json({
      success: true,
      message: "Skill deleted successfully",
    } as ApiResponse<null>)
  } catch (error) {
    console.error("[v0] Delete skill error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
