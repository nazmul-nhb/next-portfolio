import { NextResponse } from "next/server"

export async function POST(): Promise<Response> {
  const response = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  })

  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
  })

  return response
}
