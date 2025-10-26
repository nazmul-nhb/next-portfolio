import { createMessage } from "@/lib/db-utils"
import { messageSchema } from "@/lib/validations"
import type { ApiResponse } from "@/lib/types"

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const validation = messageSchema.safeParse(body)

    if (!validation.success) {
      return Response.json({ success: false, error: validation.error.errors[0].message } as ApiResponse<null>, {
        status: 400,
      })
    }

    const message = await createMessage({
      ...validation.data,
      isRead: false,
    })

    return Response.json(
      {
        success: true,
        data: message,
        message: "Message sent successfully",
      } as ApiResponse<any>,
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Create message error:", error)
    return Response.json({ success: false, error: "Internal server error" } as ApiResponse<null>, { status: 500 })
  }
}
