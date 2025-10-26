"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { apiCall } from "@/lib/fetch"
import type { Message } from "@/lib/types"
import { Trash2, Mail, MailOpen } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  useEffect(() => {
    loadMessages()
  }, [])

  const loadMessages = async () => {
    setIsLoading(true)
    const response = await apiCall("/admin/messages", { method: "GET" })
    if (response.success && response.data) {
      setMessages(response.data)
    }
    setIsLoading(false)
  }

  const handleMarkAsRead = async (id: string) => {
    await apiCall(`/admin/messages/${id}`, { method: "PATCH" })
    await loadMessages()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure?")) {
      await apiCall(`/admin/messages/${id}`, { method: "DELETE" })
      await loadMessages()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Messages</h2>
        <span className="text-sm text-muted-foreground">{messages.filter((m) => !m.isRead).length} unread</span>
      </div>

      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : messages.length === 0 ? (
        <div className="text-center text-muted-foreground">No messages yet</div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <Card key={message.id} className={!message.isRead ? "border-primary" : ""}>
              <CardContent className="flex items-start justify-between pt-6">
                <div className="flex-1 cursor-pointer" onClick={() => setSelectedMessage(message)}>
                  <div className="flex items-center gap-2">
                    {!message.isRead ? (
                      <Mail className="h-4 w-4 text-primary" />
                    ) : (
                      <MailOpen className="h-4 w-4 text-muted-foreground" />
                    )}
                    <p className="font-medium">{message.subject}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    From: {message.senderName} ({message.senderEmail})
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm">{message.content}</p>
                </div>
                <div className="flex gap-2">
                  {!message.isRead && (
                    <Button variant="ghost" size="sm" onClick={() => handleMarkAsRead(message.id)}>
                      Mark Read
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(message.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium">From</p>
                <p className="text-sm text-muted-foreground">
                  {selectedMessage.senderName} ({selectedMessage.senderEmail})
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{selectedMessage.content}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
