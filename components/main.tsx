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
    if (objective.startsWith("/search ")) {
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

  const stopHandler = () => {
    if (sourceRef.current) {
      sourceRef.current.cancel("Operation canceled by the user.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    const lastChar = value[value.length - 1];

    // スペースが含まれている場合はサジェストを表示しない
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
      <div className="h-[calc(100vh-250px)] mb-5 rounded-xl overflow-y-auto shadow-lg border border-gray-200 bg-white p-4">
        {/* メッセージ */}
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8">
            <svg
              className="w-16 h-16 mb-4 opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <p className="text-lg font-medium mb-2">
              Welcome to MCP Marketplace
            </p>
            <p className="text-sm text-center max-w-md">
              Use{" "}
              <span className="font-mono bg-gray-100 px-2 py-1 rounded">
                /search
              </span>{" "}
              to find MCP servers
            </p>
          </div>
        )}
        {messages.map((data, index) => (
          <div key={index}>
            {data.type === "objective" ? (
              <div className="text-center mb-6 font-bold text-lg border-b py-5 bg-linear-to-r from-blue-50 to-indigo-50 -mx-4 px-4 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-blue-800">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span>{data.text}</span>
                </div>
              </div>
            ) : data.type === "task-result" ? (
              <div className="flex items-end justify-end mb-4">
                <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white p-4 rounded-2xl rounded-br-sm shadow-md max-w-2xl">
                  <div className="text-xs font-semibold mb-1 opacity-90">
                    Agent Response
                  </div>
                  <div className="leading-relaxed wrap-break-word whitespace-pre-wrap">
                    {data.text}
                  </div>
                </div>
              </div>
            ) : data.type === "mcp-search-result" ? (
              <div className="mb-6">
                <div className="flex items-end mb-6">
                  <div className="bg-linear-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-2xl rounded-bl-sm shadow-sm max-w-2xl">
                    <div className="text-xs font-semibold text-green-700 mb-1">
                      Search Results
                    </div>
                    <div className="leading-relaxed wrap-break-word whitespace-pre-wrap text-gray-800">
                      {data.text}
                    </div>
                  </div>
                </div>
                {data.mcpCandidates && data.mcpCandidates.length > 0 && (
                  <div>
                    <div className="mb-3 text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <svg
                        className="w-5 h-5 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      Found {data.mcpCandidates.length} MCP Server
                      {data.mcpCandidates.length > 1 ? "s" : ""}
                    </div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {data.mcpCandidates.map((candidate, idx) => (
                        <MCPCard key={idx} candidate={candidate} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <></>
            )}
          </div>
        ))}

        {/* ローディング中 */}
        {loading && (
          <div>
            <div className="flex items-center gap-3 my-4">
              <div className="flex items-center gap-2 px-5 py-3 text-white bg-linear-to-r from-blue-500 to-blue-600 rounded-full shadow-md">
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span className="font-medium">Thinking...</span>
              </div>
            </div>
          </div>
        )}
        <div ref={messageEndRef} />
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
        <div className="mb-4 relative">
          {/* 目的入力 */}
          <label
            htmlFor="objective"
            className="text-xs text-gray-600 font-medium block mb-1"
          >
            Your Objective
          </label>
          <textarea
            className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 focus:outline-none focus:border-blue-500 transition-colors resize-none"
            rows={1}
            placeholder="Enter your objective or use /search to find MCP servers..."
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
        </div>
        <div className="flex items-center justify-center gap-4">
          {/* スタート */}
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition-all transform ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-linear-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:scale-105"
            } text-white`}
            onClick={startHandler}
            disabled={loading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>Start</span>
          </button>
          {/* ストップ */}
          <button
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold shadow-md transition-all transform ${
              loading
                ? "bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 hover:shadow-lg hover:scale-105"
                : "bg-gray-300 cursor-not-allowed"
            } text-white`}
            onClick={stopHandler}
            disabled={!loading}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
              />
            </svg>
            <span>Stop</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
