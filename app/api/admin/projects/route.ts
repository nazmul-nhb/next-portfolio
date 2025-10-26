import { getAllProjects, createProject } from "@/lib/db-utils"
import { projectSchema } from "@/lib/validations"
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

export async function GET(): Promise<Response> {
  try {
    const auth = await checkAdminAuth()
    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" } as ApiResponse<null>, { status: 401 })
    }

    const projects = await getAllProjects()
    return Response.json({
      success: true,
      data: projects,
    } as ApiResponse<any>)
  } catch (error) {
    console.error("[v0] Get projects error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}

export async function POST(req: Request): Promise<Response> {
  try {
    const auth = await checkAdminAuth()
    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" } as ApiResponse<null>, { status: 401 })
    }

    const body = await req.json()
    const validation = projectSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ success: false, error: validation.error.errors[0].message } as ApiResponse<null>, {
        status: 400,
      })
    }

    const project = await createProject(validation.data)
    return Response.json(
      {
        success: true,
        data: project,
        message: "Project created successfully",
      } as ApiResponse<any>,
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Create project error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
