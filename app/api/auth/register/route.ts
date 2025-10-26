import { getUserByEmail, createUser } from "@/lib/db-utils"
import { registerSchema } from "@/lib/validations"
import { signToken } from "@/lib/auth"
import { hashPassword } from "@/lib/password"
import type { ApiResponse, AuthResponse } from "@/lib/types"

export async function POST(req: Request): Promise<Response> {
  try {
    const body = await req.json()
    const validation = registerSchema.safeParse(body)

    if (!validation.success) {
      return Response.json(
        {
          success: false,
          error: validation.error.errors[0].message,
        } as ApiResponse<AuthResponse>,
        { status: 400 },
      )
    }

    const { email, password, name } = validation.data

    // Check if user exists
    const existingUser = await getUserByEmail(email)

    if (existingUser) {
      return Response.json(
        {
          success: false,
          error: "User already exists",
        } as ApiResponse<AuthResponse>,
        { status: 400 },
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with default 'user' role
    const user = await createUser({
      email,
      passwordHash: hashedPassword,
      name,
    })

    const token = await signToken({ userId: user.id, email: user.email, role: user.role })

    const response = Response.json(
      {
        success: true,
        data: {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          },
          token,
        },
      } as ApiResponse<AuthResponse>,
      { status: 201 },
    )

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error("[v0] Registration error:", error)
    return Response.json(
      {
        success: false,
        error: "Internal server error",
      } as ApiResponse<AuthResponse>,
      { status: 500 },
    )
  }
}
