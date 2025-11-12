"use client";

import axios, { CancelTokenSource } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageType } from "./types";
import MCPCard from "./MCPCard";
import CommandSuggestion from "./CommandSuggestion";
import { slashCommands } from "@/types/commands";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

const Main = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(0);
  const [filteredCommands, setFilteredCommands] = useState(slashCommands);
  const objectiveRef = useRef<HTMLTextAreaElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<CancelTokenSource | null>(null);

  const scrollToBottom = useCallback(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [scrollToBottom]);

  const messageHandler = (message: MessageType) => {
    setMessages((messages) => [...messages, message]);
  };

  const startHandler = async () => {
    setLoading(true);

    const objective = objectiveRef.current!.value;
    if (!objective) {
      setLoading(false);
      return;
    }

    sourceRef.current = axios.CancelToken.source();

    // Check for slash command
    if (objective.startsWith("/search")) {
      const query = objective.substring(8).trim();
      const messageObjective = { type: "objective", text: objective };
      messageHandler(messageObjective);

      try {
        const response = await axios.post(
          "/api/search",
          { query },
          { cancelToken: sourceRef.current.token }
        );

        const { message, mcpCandidates } = response.data;
        const resultMessage = {
          type: "mcp-search-result",
          text: message.content,
          mcpCandidates,
        };
        messageHandler(resultMessage);
      } catch (error) {
        if (!axios.isCancel(error)) {
          const errorMessage = {
            type: "task-result",
            text: "検索中にエラーが発生しました。",
          };
          messageHandler(errorMessage);
        }
      } finally {
        setLoading(false);
        objectiveRef.current!.value = "";
      }
      return;
    }

    // Default behavior - call OpenAI chat API
    const messageObjective = { type: "objective", text: objective };
    messageHandler(messageObjective);

    try {
      // ユーザーメッセージをチャット履歴に追加
      const userMessage: ChatMessage = {
        role: "user",
        content: objective,
      };
      const updatedHistory = [...chatHistory, userMessage];
      setChatHistory(updatedHistory);

      // OpenAI APIに送信
      const response = await axios.post(
        "/api/chat",
        { messages: updatedHistory },
        { cancelToken: sourceRef.current.token }
      );

      const aiResponse = response.data.response;

      // AIレスポンスをチャット履歴に追加
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
      };
      setChatHistory([...updatedHistory, assistantMessage]);

      // メッセージを表示
      const messageResult = {
        type: "task-result",
        text: aiResponse,
      };
      messageHandler(messageResult);
    } catch (error) {
      if (!axios.isCancel(error)) {
        const errorMessage = {
          type: "task-result",
          text: "エラーが発生しました。もう一度お試しください。",
        };
        messageHandler(errorMessage);
      }
    } finally {
      objectiveRef.current!.value = "";
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];

    if (value.includes(" ")) {
      setShowSuggestions(false);
      return;
    }

    if (lastChar === "/") {
      setShowSuggestions(true);
      setFilteredCommands(slashCommands);
      setSelectedSuggestionIndex(0);
    } else if (value.startsWith("/")) {
      const input = value.substring(1);
      const filtered = slashCommands.filter((cmd) =>
        cmd.command.substring(1).toLowerCase().startsWith(input.toLowerCase())
      );
      setFilteredCommands(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < filteredCommands.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const selectedCommand = filteredCommands[selectedSuggestionIndex];
      if (selectedCommand && objectiveRef.current) {
        objectiveRef.current.value = selectedCommand.usage;
        setShowSuggestions(false);
        // Move cursor to end
        setTimeout(() => {
          if (objectiveRef.current) {
            objectiveRef.current.selectionStart =
              objectiveRef.current.value.length;
            objectiveRef.current.selectionEnd =
              objectiveRef.current.value.length;
            objectiveRef.current.focus();
          }
        }, 0);
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  const handleCommandSelect = (command: string) => {
    if (objectiveRef.current) {
      const usage = slashCommands.find((cmd) => cmd.command === command)?.usage;
      if (usage) {
        objectiveRef.current.value = usage;
        setShowSuggestions(false);
        objectiveRef.current.focus();
      }
    }
  };

  return (
    <div>
      <div className="h-[calc(100vh-240px)] mb-4 rounded-2xl overflow-y-auto border border-neutral-200 bg-white p-5">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-neutral-500 p-8">
            <div className="w-14 h-14 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center mb-3">
              <svg
                className="w-7 h-7 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                />
              </svg>
            </div>
            <p className="text-base font-medium text-neutral-900 mb-2">
              Start a conversation
            </p>
            <p className="text-sm text-center max-w-md text-neutral-500">
              Type{" "}
              <span className="font-mono bg-neutral-100 px-2 py-1 rounded text-neutral-700 border border-neutral-200">
                /search
              </span>{" "}
              to find MCP servers or just chat
            </p>
          </div>
        )}
        {messages.map((data, index) => (
          <div key={index}>
            {data.type === "objective" ? (
              <div className="flex items-start gap-3 mb-5">
                <div className="w-7 h-7 rounded-full bg-neutral-900 flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5">
                  U
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-900 leading-relaxed">
                    {data.text}
                  </p>
                </div>
              </div>
            ) : data.type === "task-result" ? (
              <div className="flex items-start gap-3 mb-5">
                <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">
                    {data.text}
                  </p>
                </div>
              </div>
            ) : data.type === "mcp-search-result" ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                    <div className="w-2 h-2 bg-neutral-600 rounded-full"></div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap mb-4">
                      {data.text}
                    </p>
                    {data.mcpCandidates && data.mcpCandidates.length > 0 && (
                      <div className="space-y-3">
                        <div className="text-xs font-medium text-neutral-500">
                          Found {data.mcpCandidates.length} result
                          {data.mcpCandidates.length > 1 ? "s" : ""}
                        </div>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                          {data.mcpCandidates.map((candidate, idx) => (
                            <MCPCard key={idx} candidate={candidate} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        ))}

        {/* ローディング中 */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
              <svg
                className="animate-spin h-3.5 w-3.5 text-neutral-600"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-neutral-500">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="bg-white rounded-2xl border border-neutral-200 p-4">
        <div className="relative">
          <textarea
            className="w-full border border-neutral-200 rounded-xl py-3 px-4 pr-24 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-all resize-none text-sm"
            rows={1}
            placeholder="Ask anything or type /search..."
            ref={objectiveRef}
            disabled={loading}
            id="objective"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          {showSuggestions && (
            <CommandSuggestion
              commands={filteredCommands}
              selectedIndex={selectedSuggestionIndex}
              onSelect={handleCommandSelect}
            />
          )}
          <button
            className={`absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              loading
                ? "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                : "bg-neutral-900 text-white hover:bg-neutral-800"
            }`}
            onClick={startHandler}
            disabled={loading}
          >
            {loading ? "Stop" : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
