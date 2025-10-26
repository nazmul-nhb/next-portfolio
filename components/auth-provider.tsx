"use client"

import type React from "react"

import { useEffect } from "react"
import { useAuthStore } from "@/lib/store"
import { apiCall } from "@/lib/fetch"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser, setToken } = useAuthStore()

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = async () => {
      const response = await apiCall("/auth/me", { method: "GET" })
      if (response.success && response.data) {
        setUser(response.data)
      }
    }

    checkAuth()
  }, [setUser, setToken])

  return <>{children}</>
}
