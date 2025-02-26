// src/components/dashboard/ChatBot.tsx
"use client";

import React, { useState } from "react";
import { SendHorizontal, User, Bot, Paperclip, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  sender: "user" | "bot";
  timestamp: Date;
};

interface ChatBotProps {
  onClose?: () => void;
}

export function ChatBot({ onClose }: ChatBotProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you analyze your sports data today?",
      sender: "bot",
      timestamp: new Date(),
    },
    {
      id: "2",
      content: "Hi, can you show me some insights about the Premier League scoring trends?",
      sender: "user",
      timestamp: new Date(Date.now() - 1000 * 60 * 2),
    },
    {
      id: "3",
      content: "I've analyzed the Premier League data and found that scoring has increased by 12% compared to last season. The average goals per match is now 2.7, up from 2.4 last season.",
      sender: "bot",
      timestamp: new Date(Date.now() - 1000 * 60),
    },
  ]);

  const sendMessage = () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      content: input,
      sender: "user",
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    
    // Simulate bot response
    setTimeout(() => {
      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        content: "I'm analyzing your question about sports data. Let me get back to you with comprehensive insights in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b flex justify-between items-center">
        <div>
          <h3 className="font-semibold text-sm">Sports Analysis Assistant</h3>
          <p className="text-xs text-muted-foreground">Ask questions about your data</p>
        </div>
        {onClose && (
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={onClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-3">
        <div className="flex flex-col gap-3">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-2 max-w-[90%]", 
                message.sender === "user" ? "ml-auto" : "mr-auto"
              )}
            >
              {message.sender === "bot" && (
                <Avatar className="h-8 w-8 border bg-primary/10 flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary" />
              </Avatar>
              )}
              <div className={cn(
                "rounded-lg p-3",
                message.sender === "user" 
                  ? "bg-primary text-primary-foreground" 
                  : "bg-muted"
              )}>
                <p className="text-sm">{message.content}</p>
                <p className="text-[10px] opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              {message.sender === "user" && (
                <Avatar className="h-8 w-8 border flex items-center justify-center">
                <User className="h-4 w-4" />
              </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t mt-auto">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }} 
          className="flex gap-2"
        >
          <Button 
            type="button" 
            size="icon" 
            variant="ghost" 
            className="shrink-0"
          >
            <Paperclip className="h-4 w-4" />
            <span className="sr-only">Attach file</span>
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            className="shrink-0"
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
      </div>
    </div>
  );
}