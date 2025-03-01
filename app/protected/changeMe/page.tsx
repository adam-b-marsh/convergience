"use client"

import { useState, useMemo } from "react"
import Image from "next/image"
import { ArrowLeft, Send, Reply } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type MessageType = "statement" | "claim" | "axiom"| "question" | "evidence" // "axiom" is anotehr type - but that has to be voted on by both users

interface Message {
  id: string
  content: string
  type: MessageType
  sender: "user1" | "user2"
  timestamp?: string
  connectedTo?: string
}

export default function DiscussionInterface() {
  // Combined messages array with sender information
  const [messages] = useState<Message[]>([
    {
      id: "1",
      content: "I am a statement - with no designated type",
      type: "statement",
      sender: "user1",
    },
    {
      id: "2",
      content: "I am an Axiom",
      type: "axiom",
      sender: "user1",
      timestamp: "09:42",
    },
    {
      id: "3",
      content: "I am a claim",
      type: "claim",
      sender: "user2",
    },
    {
      id: "4",
      content: "I am a question?",
      type: "question",
      sender: "user2",
    },
    {
      id: "5",
      content: "I am Evidence printing and typesetting industry Lorem Ipsum has been the industry's standard dummy text ever since the 1500s when an unknown printer took a galley of type and scrambled it to make a type specimen book it has?",
      type: "evidence",
      sender: "user2",
      timestamp: "09:56",
    },
    {
      id: "6",
      content: "What does this dummy text mean?",
      type: "question",
      sender: "user2",
      timestamp: "09:56",
    },
  ])

  const [newMessage, setNewMessage] = useState("")
  const [statementType, setStatementType] = useState("claim")
  const [connectionType, setConnectionType] = useState("supports")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null)

  // Group messages by sender and adjacent timestamps
  const messageGroups = useMemo(() => {
    const groups: Message[][] = []
    let currentGroup: Message[] = []
    
    messages.forEach((message, index) => {
      const prevMessage = index > 0 ? messages[index - 1] : null
      
      // Start a new group if:
      // 1. This is the first message
      // 2. Sender changed
      if (!prevMessage || prevMessage.sender !== message.sender) {
        if (currentGroup.length > 0) {
          groups.push([...currentGroup])
        }
        currentGroup = [message]
      } else {
        currentGroup.push(message)
      }
    })
    
    // Add the last group
    if (currentGroup.length > 0) {
      groups.push(currentGroup)
    }
    
    return groups
  }, [messages])

  // Get style for message based on type
  const getMessageStyle = (type: MessageType) => {
    switch (type) {
      case "axiom":
        return "border-yellow-400 bg-yellow-50"
      case "claim":
        return "border-green-400 bg-green-50"
      case "question":
        return "border-red-400 bg-red-50"
      case "evidence":
        return "border-blue-400 bg-blue-50"
      default:
        return "border-gray-200 bg-white"
    }
  }

  // Determine corner styles based on position in group
  const getCornerStyles = (isUser1: boolean, isFirst: boolean, isLast: boolean) => {
    if (isUser1) {
      // For user1 (left side), always round the right corners (inner side)
      return `rounded-r-lg ${isFirst ? "rounded-tl-lg" : ""} ${isLast ? "rounded-bl-lg" : ""}`
    } else {
      // For user2 (right side), always round the left corners (inner side)
      return `rounded-l-lg ${isFirst ? "rounded-tr-lg" : ""} ${isLast ? "rounded-br-lg" : ""}`
    }
  }

  // Handle reply button click
  const handleReply = (messageId: string) => {
    setReplyingTo(messageId)
    // Find the message to set it in the reply area
    const message = messages.find(m => m.id === messageId)
    if (message) {
      // You could show a preview of the message being replied to
      // or focus the text input
    }
  }

  return (
    <div className="flex bg-gray-100">
      <div className="flex flex-col w-full mx-auto p-4">
        <div className="flex flex-row h-full">
          {/* Left panel - Discussion */}
          <div className="w-1/2 bg-white rounded-lg shadow-sm overflow-hidden">
            <h2 className="text-base font-medium p-4 bg-gray-50 border-b">Discussion 1</h2>
            <div className="overflow-y-auto p-4 space-y-4">
              
              {/* Message Groups */}
              {messageGroups.map((group, groupIndex) => {
                const isUser1 = group[0].sender === "user1"
                
                return (
                  <div 
                    key={`group-${groupIndex}`} 
                    className={`flex ${isUser1 ? "items-start" : "flex-row-reverse items-start"} gap-3 mb-6`}
                  >
                    {/* Avatar - appears only once per group */}
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-blue-500 flex items-center justify-center text-white font-medium">
                      {isUser1 ? 'A' : 'B'}
                    </div>
                    
                    {/* Messages */}
                    <div className={`flex-1 ${!isUser1 ? "flex flex-col items-end" : ""}`}>
                      {group.map((message, messageIndex) => {
                        const isFirst = messageIndex === 0
                        const isLast = messageIndex === group.length - 1
                        const cornerStyles = getCornerStyles(isUser1, isFirst, isLast)
                        
                        return (
                          <div 
                            key={message.id} 
                            className={`relative mb-1 group ${!isUser1 ? "ml-auto max-w-[80%]" : "max-w-[80%]"}`}
                          >
                            <div className={`p-3 border ${cornerStyles} ${getMessageStyle(message.type)}`}>
                              {message.content}
                            </div>
                            
                            {/* Reply button that appears on hover with shadcn/ui tooltip */}
                            <div className={`absolute ${isUser1 ? "right-0 translate-x-full mr-[-8px]" : "left-0 -translate-x-full ml-[-8px]"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100`}>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <button 
                                      className="p-1 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors h-8 w-8 flex items-center justify-center"
                                      onClick={() => handleReply(message.id)}
                                      aria-label="Reply to this message"
                                    >
                                      <Reply className="h-4 w-4 text-gray-600" />
                                    </button>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p>Reply</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        )
                      })}
                      
                      {/* Timestamp shown once per group */}
                      {group[group.length - 1].timestamp && (
                        <div className={`text-xs text-gray-500 mt-1 ${!isUser1 ? "text-right" : ""}`}>
                          {group[group.length - 1].timestamp}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Input area */}
            <div className="border-t">
              <div className="p-4">
                {/* Show reply preview if replying to a message */}
                {replyingTo && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-2 mb-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <ArrowLeft className="h-4 w-4 text-gray-400 mr-2" />
                      <span>
                        Replying to: {messages.find(m => m.id === replyingTo)?.content.substring(0, 50)}
                        {(messages.find(m => m.id === replyingTo)?.content.length || 0) > 50 ? "..." : ""}
                      </span>
                    </div>
                    <button 
                      className="text-xs text-gray-500 hover:text-gray-700"
                      onClick={() => setReplyingTo(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {/* Only show Connection Type when replying to a message */}
                {replyingTo && (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-gray-500">Connection Type</span>
                    <Select value={connectionType} onValueChange={setConnectionType}>
                      <SelectTrigger className="w-32 h-8 text-sm">
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="supports">Supports</SelectItem>
                        <SelectItem value="opposes">Opposes</SelectItem>
                        <SelectItem value="relates">Relates to</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="border rounded-lg">
                  <Textarea
                    placeholder="Enter your statement here"
                    className="border-0 focus-visible:ring-0 resize-none min-h-[120px] rounded-t-lg"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />
                  <div className="flex justify-between items-center p-2 bg-gray-50 border-t">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-500 mr-2">Statement Type</span>
                      <Select value={statementType} onValueChange={setStatementType}>
                        <SelectTrigger className="w-32 h-8 text-sm">
                          <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="claim">Claim</SelectItem>
                          <SelectItem value="statement">Statement</SelectItem>
                          <SelectItem value="question">Question</SelectItem>
                          <SelectItem value="evidence">Evidence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="bg-blue-400 hover:bg-blue-500 text-white">
                      Submit <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel - Empty canvas */}
          <div className="w-1/2 ml-4">
            <div className="border rounded-lg h-full bg-white shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  )
}