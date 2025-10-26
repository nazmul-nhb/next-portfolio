"use client"

import { AIChat } from "@/components/ai-chat"

export default function ChatPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold">AI Assistant</h1>
      <p className="mt-4 text-lg text-muted-foreground">Ask me questions about my skills, projects, and experience</p>

      <div className="mt-8">
        <AIChat />
      </div>
    </div>
  )
}
