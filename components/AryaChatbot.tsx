"use client";

import { useState, useRef, useEffect } from "react";
import type { ReactNode } from "react";
import { Send, Bot } from "lucide-react";
import { ChatMessage, AssistantResponse } from "@/types/mobility";

interface ChatMessageProps {
  message: ChatMessage;
}

function ChatMessageComponent({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const renderInline = (text: string) => {
    const parts = text.split("**");
    return parts.map((part, idx) =>
      idx % 2 === 1 ? <span key={idx} className="font-semibold">{part}</span> : <span key={idx}>{part}</span>
    );
  };
  const renderContent = (text: string) => {
    const lines = text.split(/\r?\n/);
    const blocks: ReactNode[] = [];
    let i = 0;
    while (i < lines.length) {
      const line = lines[i];
      if (/^\s*\d+\.\s+/.test(line)) {
        const items: ReactNode[] = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          const content = lines[i].replace(/^\s*\d+\.\s+/, "");
          items.push(<li key={i}>{renderInline(content)}</li>);
          i++;
        }
        blocks.push(<ol key={`ol-${i}`} className="list-decimal ml-5 space-y-1 text-sm">{items}</ol>);
        continue;
      }
      if (/^\s*[\-*]\s+/.test(line)) {
        const items: ReactNode[] = [];
        while (i < lines.length && /^\s*[\-*]\s+/.test(lines[i])) {
          const content = lines[i].replace(/^\s*[\-*]\s+/, "");
          items.push(<li key={i}>{renderInline(content)}</li>);
          i++;
        }
        blocks.push(<ul key={`ul-${i}`} className="list-disc ml-5 space-y-1 text-sm">{items}</ul>);
        continue;
      }
      if (line.trim().length === 0) {
        i++;
        continue;
      }
      blocks.push(<p key={`p-${i}`} className="text-sm">{renderInline(line)}</p>);
      i++;
    }
    return <div className="space-y-1">{blocks}</div>;
  };
  
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-accent-warm flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`max-w-sm lg:max-w-lg px-4 py-2 rounded-lg ${
        isUser 
          ? "bg-accent-warm text-white rounded-br-none" 
          : "bg-surface-dark dark:bg-gray-700 rounded-bl-none"
      }`}>
        {isUser ? (
          <p className="text-sm">{message.content}</p>
        ) : (
          renderContent(message.content)
        )}
        <p className="text-xs opacity-70 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">U</span>
        </div>
      )}
    </div>
  );
}

export default function AryaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm ARYA, your Dubai mobility assistant. How are you today? How may I assist you with getting around Dubai?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Debug logging
  useEffect(() => {
    console.log("ARYA Chatbot mounted, isOpen:", isOpen);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.log("Location access denied, using Dubai center");
          setUserLocation({
            latitude: 25.2048,
            longitude: 55.2708,
          });
        }
      );
    }
  }, []);

  

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log("Sending message to API:", userMessage.content);
      const response = await fetch("/api/arya", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage.content,
          userLocation,
          conversationHistory: messages,
        }),
      });

      console.log("API response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to get response: ${response.status}`);
      }

      const data: AssistantResponse = await response.json();
      console.log("API response data:", data);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date().toISOString(),
        context: {
          topic: "mobility",
          relatedData: data.data,
        },
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Handle actions
      if (data.actions && data.actions.length > 0) {
        data.actions.forEach(action => {
          if (action.type === "navigate" && action.payload) {
            console.log("Navigation action:", action.payload);
          }
        });
      }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const openHandler = (e: Event) => {
      setIsOpen(true);
      const detail = (e as CustomEvent).detail as { message?: string } | undefined;
      if (detail?.message) {
        setInput(detail.message);
        sendMessage();
      }
    };
    window.addEventListener("arya:open", openHandler as EventListener);
    return () => window.removeEventListener("arya:open", openHandler as EventListener);
  }, [sendMessage]);

  const quickQueries = [
    "I'm planning to visit Dubai Mall this afternoon",
    "Where can I charge my electric car?",
    "Is it too hot to walk outside right now?",
    "What's the best way to get to the beach?",
    "Where should I park for the Dubai Opera?",
  ];

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-accent-warm hover:bg-accent-warm/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-border-color dark:border-gray-700 flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-color dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-accent-warm flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">ARYA Assistant</h3>
            <p className="text-xs text-text-secondary dark:text-gray-400">Online</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1 hover:bg-surface-dark dark:hover:bg-gray-700 rounded"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <ChatMessageComponent key={message.id} message={message} />
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-warm flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface-dark dark:bg-gray-700 rounded-lg rounded-bl-none px-4 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Queries */}
      <div className="p-3 border-t border-border-color dark:border-gray-700">
        <p className="text-xs text-text-secondary dark:text-gray-400 mb-2">Try asking:</p>
        <div className="flex flex-wrap gap-1">
          {quickQueries.slice(0, 3).map((query, index) => (
            <button
              key={index}
              onClick={() => {
                setInput(query);
                sendMessage();
              }}
              className="text-xs px-2 py-1 bg-surface-dark dark:bg-gray-700 hover:bg-accent-warm hover:text-white rounded transition-colors"
              disabled={isLoading}
            >
              {query}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border-color dark:border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything about mobility..."
            className="flex-1 px-3 py-2 text-sm border border-border-color dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-warm dark:bg-gray-700"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="px-3 py-2 bg-accent-warm hover:bg-accent-warm/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}