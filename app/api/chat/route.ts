import { streamText } from "ai"
import { getProfile } from "@/lib/db-utils"

export async function POST(req: Request) {
  const { messages } = await req.json()

  // Get portfolio profile for context
  const profile = await getProfile()

  const systemPrompt = `You are an AI assistant representing ${profile?.name || "a developer"}. 
You have access to the following information about them:
- Title: ${profile?.title || "Not specified"}
- Bio: ${profile?.bio || "Not specified"}
- Email: ${profile?.email || "Not specified"}
- Location: ${profile?.location || "Not specified"}

You should answer questions about the portfolio owner, their skills, projects, and experience. 
Be helpful, professional, and friendly. If asked about something not in your knowledge base, 
suggest contacting them directly via the contact form.

Keep responses concise and relevant to the portfolio context.`

  const result = streamText({
    model: "openai/gpt-4o-mini",
    system: systemPrompt,
    messages,
  })

  return result.toUIMessageStreamResponse()
}
