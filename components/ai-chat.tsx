// "use client"

// import { useChat } from "ai/react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Card } from "@/components/ui/card"
// import { ScrollArea } from "@/components/ui/scroll-area"
// import { Send, X } from "lucide-react"

// interface AIChatProps {
//   onClose?: () => void
// }

// export function AIChat({ onClose }: AIChatProps) {
//   const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
//     api: "/api/chat",
//   })

//   return (
//     <Card className="flex h-96 flex-col border-primary">
//       <div className="flex items-center justify-between border-b border-border px-4 py-3">
//         <h3 className="font-semibold">Ask me anything</h3>
//         {onClose && (
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-4 w-4" />
//           </Button>
//         )}
//       </div>

//       <ScrollArea className="flex-1 px-4 py-4">
//         <div className="space-y-4">
//           {messages.length === 0 && (
//             <p className="text-center text-sm text-muted-foreground">
//               Hi! Ask me about my skills, projects, or experience.
//             </p>
//           )}
//           {messages.map((message) => (
//             <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
//               <div
//                 className={`max-w-xs rounded-lg px-3 py-2 text-sm ${
//                   message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
//                 }`}
//               >
//                 {message.content}
//               </div>
//             </div>
//           ))}
//           {isLoading && (
//             <div className="flex justify-start">
//               <div className="rounded-lg bg-muted px-3 py-2">
//                 <div className="flex gap-1">
//                   <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
//                   <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-100" />
//                   <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-200" />
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       </ScrollArea>

//       <form onSubmit={handleSubmit} className="border-t border-border px-4 py-3">
//         <div className="flex gap-2">
//           <Input
//             value={input}
//             onChange={handleInputChange}
//             placeholder="Ask a question..."
//             disabled={isLoading}
//             className="text-sm"
//           />
//           <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
//             <Send className="h-4 w-4" />
//           </Button>
//         </div>
//       </form>
//     </Card>
//   )
// }
