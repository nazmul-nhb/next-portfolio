import { uploadToCloudinary } from "@/lib/cloudinary"
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

export async function POST(req: Request): Promise<Response> {
  try {
    const auth = await checkAdminAuth()
    if (!auth) {
      return Response.json({ success: false, error: "Unauthorized" } as ApiResponse<null>, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return Response.json({ success: false, error: "No file provided" } as ApiResponse<null>, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return Response.json({ success: false, error: "Invalid file type" } as ApiResponse<null>, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return Response.json({ success: false, error: "File too large" } as ApiResponse<null>, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const filename = `${Date.now()}-${file.name}`
    const url = await uploadToCloudinary(Buffer.from(buffer), filename)

    return Response.json(
      {
        success: true,
        data: { url },
        message: "Image uploaded successfully",
      } as ApiResponse<any>,
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return Response.json({ success: false, error: "Upload failed" } as ApiResponse<null>, { status: 500 })
  }
}
