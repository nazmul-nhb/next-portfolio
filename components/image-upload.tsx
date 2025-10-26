"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  onUpload: (url: string) => void
  value?: string
}

export function ImageUpload({ onUpload, value }: ImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState(value)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setPreview(data.data.url)
        onUpload(data.data.url)
      } else {
        setError(data.error || "Upload failed")
      }
    } catch (err) {
      setError("Upload failed")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
          <Upload className="mr-2 h-4 w-4" />
          {isLoading ? "Uploading..." : "Upload Image"}
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={isLoading}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {preview && (
        <div className="relative h-48 w-48">
          <Image src={preview || "/placeholder.svg"} alt="Preview" fill className="rounded-lg object-cover" />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -right-2 -top-2"
            onClick={() => {
              setPreview(undefined)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
