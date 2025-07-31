"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "arjuna" | "krishna"
  content: string
  timestamp: Date
}

export default function BhagavadGitaChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "krishna",
      content:
        "Welcome, dear Arjuna. I am here to guide you through the eternal wisdom of dharma. What troubles your mind today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "arjuna",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:3000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      })

      const data = await response.json()
      console.log("Response data:", data); // Add logging to see what we're getting

      // Extract the content from data.answer which appears to be an AIMessage object
      const messageContent = data?.answer;
      const krishnaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "krishna",
        content: messageContent,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, krishnaMessage])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-red-600 to-orange-700 text-white py-8 shadow-lg">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-300" />
            <h1 className="text-4xl font-bold tracking-wide">श्रीमद्भगवद्गीता</h1>
            <Sparkles className="h-8 w-8 text-yellow-300" />
          </div>
          <p className="text-xl text-orange-100">Eternal Dialogue Between Arjuna and Krishna</p>
          <p className="text-sm text-orange-200 mt-2">Ask your questions as Arjuna and receive divine wisdom</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Decorative Elements */}
          <div className="text-center mb-8">
            <div className="inline-block bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg">
              🕉️ Sacred Conversation 🕉️
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-orange-200 overflow-hidden">
            {/* Chat Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4">
              <h2 className="text-xl font-semibold text-center">Divine Guidance</h2>
            </div>

            {/* Messages */}
            <ScrollArea className="h-96 p-6">
              <div className="space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "arjuna" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                        message.role === "arjuna"
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                          : "bg-gradient-to-r from-orange-400 to-red-400 text-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium opacity-90">
                          {message.role === "arjuna" ? "🏹 Arjuna" : "🪶 Krishna"}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white px-4 py-3 rounded-2xl shadow-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium opacity-90">🪶 Krishna</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t border-orange-200 p-4 bg-orange-50/50">
              <div className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask your question as Arjuna..."
                  className="flex-1 border-orange-300 focus:border-orange-500 focus:ring-orange-500 bg-white"
                  disabled={isLoading}
                />
                <Button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-orange-600 mt-2 text-center">
                Speak from your heart, and receive wisdom from the divine
              </p>
            </div>
          </div>

          {/* Footer Quote */}
          <div className="text-center mt-8 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-orange-200">
            <blockquote className="text-orange-800 italic text-lg font-medium">
              "यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।
              <br />
              अभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥"
            </blockquote>
            <p className="text-orange-600 text-sm mt-2">
              Whenever dharma declines and adharma rises, I manifest myself - Krishna (4.7)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
