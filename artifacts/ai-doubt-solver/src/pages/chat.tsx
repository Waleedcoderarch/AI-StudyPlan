import { useEffect, useRef, useState } from "react"
import { useLocation } from "wouter"
import { 
  useListConversations, 
  useCreateConversation, 
  useGetConversation, 
  useSendMessage,
  useDeleteConversation,
  getListConversationsQueryKey,
  getGetConversationQueryKey,
} from "@workspace/api-client-react"
import { MessageSquare, Plus, Send, Trash2, Loader2, Bot } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Chat() {
  const [location, setLocation] = useLocation()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Extract conversation ID from URL if present (e.g. /chat?id=123)
  const searchParams = new URLSearchParams(window.location.search)
  const currentId = searchParams.get("id") ? parseInt(searchParams.get("id")!) : null

  const [input, setInput] = useState("")

  const { data: conversations, isLoading: isLoadingConversations } = useListConversations({
    query: {
      queryKey: getListConversationsQueryKey()
    }
  })

  const { data: currentConversation, isLoading: isLoadingConversation } = useGetConversation(
    currentId || 0,
    {
      query: {
        enabled: !!currentId,
        queryKey: getGetConversationQueryKey(currentId || 0)
      }
    }
  )

  const createConversation = useCreateConversation()
  const sendMessage = useSendMessage()
  const deleteConversation = useDeleteConversation()

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [currentConversation?.messages])

  const handleNewChat = () => {
    createConversation.mutate(
      { data: { title: "New Conversation" } },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() })
          setLocation(`/chat?id=${data.id}`)
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to create conversation.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || sendMessage.isPending) return

    const messageContent = input.trim()
    setInput("")

    // If no conversation exists, create one first
    let targetId = currentId
    if (!targetId) {
      try {
        const newConv = await createConversation.mutateAsync({ 
          data: { title: messageContent.slice(0, 30) + (messageContent.length > 30 ? "..." : "") } 
        })
        targetId = newConv.id
        // Update URL without triggering a full re-render immediately if possible, or just setLocation
        setLocation(`/chat?id=${targetId}`)
        queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() })
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to create conversation.",
          variant: "destructive"
        })
        return
      }
    }

    sendMessage.mutate(
      { id: targetId, data: { content: messageContent } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetConversationQueryKey(targetId!) })
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() })
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to send message.",
            variant: "destructive"
          })
        }
      }
    )
  }

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteConversation.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListConversationsQueryKey() })
          if (currentId === id) {
            setLocation("/chat")
          }
          toast({
            title: "Deleted",
            description: "Conversation deleted successfully."
          })
        },
        onError: () => {
          toast({
            title: "Error",
            description: "Failed to delete conversation.",
            variant: "destructive"
          })
        }
      }
    )
  }

  return (
    <div className="flex h-[calc(100dvh-3.5rem)] md:h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <div className="hidden md:flex w-72 flex-col border-r bg-card">
        <div className="p-4 border-b">
          <Button onClick={handleNewChat} className="w-full" disabled={createConversation.isPending}>
            {createConversation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
            New Chat
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-2">
            {isLoadingConversations ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="p-3 border rounded-lg">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))
            ) : conversations?.length === 0 ? (
              <div className="text-center p-4 text-muted-foreground text-sm">
                No conversations yet
              </div>
            ) : (
              conversations?.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setLocation(`/chat?id=${conv.id}`)}
                  className={`p-3 rounded-lg cursor-pointer border hover-elevate transition-colors group relative ${
                    currentId === conv.id ? "bg-accent border-accent-foreground/20" : "bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="font-medium text-sm truncate pr-8">{conv.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 flex justify-between">
                    <span>{conv.messageCount} msgs</span>
                    <span>{formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all"
                    onClick={(e) => handleDelete(conv.id, e)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto p-4 md:p-6" ref={scrollRef}>
          {isLoadingConversation && currentId ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentConversation?.messages?.length ? (
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              {currentConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <Avatar className={`w-8 h-8 ${msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                    <AvatarFallback>{msg.role === "user" ? "U" : <Bot className="h-4 w-4" />}</AvatarFallback>
                  </Avatar>
                  <div
                    className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                  </div>
                </div>
              ))}
              {sendMessage.isPending && (
                <div className="flex gap-4 flex-row">
                  <Avatar className="w-8 h-8 bg-secondary">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl px-4 py-3 bg-muted text-foreground max-w-[80%]">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">How can I help you learn?</h2>
              <p className="text-muted-foreground">
                Ask me any question, clarify a concept, or brainstorm ideas. I'm your personal AI study companion.
              </p>
            </div>
          )}
        </div>

        <div className="p-4 bg-background border-t">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto flex gap-2 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 pr-12 rounded-full bg-muted border-transparent focus-visible:ring-1"
              disabled={sendMessage.isPending}
            />
            <Button 
              type="submit" 
              size="icon" 
              disabled={!input.trim() || sendMessage.isPending}
              className="absolute right-1 top-1 bottom-1 h-auto rounded-full w-8"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}