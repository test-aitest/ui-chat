"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { ChatMessage as ChatMessageType, MCPCandidate } from "@/types/mcp";
import ChatMessage from "./ChatMessage";
import MCPCard from "./MCPCard";

export default function SearchChat() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [mcpCandidates, setMcpCandidates] = useState<MCPCandidate[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: ChatMessageType = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("/api/search", {
        query: input,
      });

      const { message, mcpCandidates: candidates } = response.data;
      setMessages((prev) => [...prev, message]);
      setMcpCandidates(candidates);
    } catch (error) {
      console.error("Search error:", error);
      const errorMessage: ChatMessageType = {
        role: "agent",
        content: "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6 overflow-hidden">
        {/* Chat Section */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-lg shadow-md">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">Search Chat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>Start a conversation by typing your query below</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                {loading && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-gray-100 px-4 py-3 rounded-lg rounded-bl-none">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          <div className="border-t p-4">
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your query and press Enter..."
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </form>
          </div>
        </div>

        {/* MCP Candidates Section */}
        <div className="flex flex-col bg-white rounded-lg shadow-md">
          <div className="border-b px-6 py-4">
            <h2 className="text-xl font-bold text-gray-800">MCP Candidates</h2>
            {mcpCandidates.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">
                {mcpCandidates.length} result{mcpCandidates.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {mcpCandidates.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-400">
                <p>No results yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mcpCandidates.map((candidate, index) => (
                  <MCPCard key={index} candidate={candidate} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
