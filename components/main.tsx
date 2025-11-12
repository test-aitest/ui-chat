"use client";

import axios, { CancelTokenSource } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageType, TaskType } from "./types";
import MCPCard from "./MCPCard";
import CommandSuggestion from "./CommandSuggestion";
import { slashCommands } from "@/types/commands";

const Main = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] =
    useState<number>(0);
  const [filteredCommands, setFilteredCommands] = useState(slashCommands);
  const objectiveRef = useRef<HTMLTextAreaElement>(null);
  const iterationRef = useRef<HTMLInputElement>(null);
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

    const messageObjective = { type: "objective", text: objective };
    messageHandler(messageObjective);

    let taskList: TaskType[] = [];

    taskList.push({
      taskID: "1",
      taskName: "目的を達成するためのリストを作成してください",
    });

    let iteration = 0;
    const maxIteration = Number(iterationRef.current!.value);

    try {
      while (maxIteration === 0 || iteration < maxIteration) {
        if (taskList.length <= 0) {
          setLoading(false);
          return;
        }

        const taskListString = taskList
          .map((task) => `${task.taskID}. ${task.taskName}`)
          .join("\n");

        const messageTaskList = { type: "task-list", text: taskListString };
        messageHandler(messageTaskList);

        const task = taskList.shift()!;

        const messageNextTask = {
          type: "next-task",
          text: `${task.taskID}. ${task.taskName}`,
        };
        messageHandler(messageNextTask);

        const responseExecute = await axios.post(
          "/api/execute",
          {
            objective,
            task: task.taskName,
          },
          {
            cancelToken: sourceRef.current.token,
          }
        );

        const resultExecute = responseExecute?.data?.response;

        const messageTaskResult = {
          type: "task-result",
          text: resultExecute.trim(),
        };
        messageHandler(messageTaskResult);

        const responseCreate = await axios.post(
          "/api/create",
          {
            objective,
            taskList,
            task,
            result: resultExecute,
          },
          {
            cancelToken: sourceRef.current.token,
          }
        );

        taskList = responseCreate?.data?.response;

        iteration++;
      }

      objectiveRef.current!.value = "";
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Canceled by the user.");
      }
    } finally {
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
      <div className="grid grid-cols-4 h-(--adjusted-height) mb-5 text-sm border rounded-lg">
        <div className="col-span-1 rounded-s-lg p-3 overflow-y-auto bg-gray-50 border-r">
          {/* タスクリスト */}
          <div className="font-bold mb-3">Tasks</div>
          {messages
            .filter((data) => data.type === "task-list")
            .slice(-1)
            .map((data, index) => (
              <div key={index}>
                <div className="leading-relaxed wrap-break-word whitespace-pre-wrap">
                  {data.text}
                </div>
              </div>
            ))}
        </div>

        <div className="col-span-3 rounded-e-lg overflow-y-auto bg-white">
          {/* メッセージ */}
          {messages.map((data, index) => (
            <div key={index}>
              {data.type === "objective" ? (
                <div className="text-center mb-4 font-bold text-lg border-b py-4 bg-gray-50">
                  <div>🎯{data.text}</div>
                </div>
              ) : data.type === "task-result" ? (
                <div className="flex items-end justify-end mb-4">
                  <div className="bg-blue-500 text-white p-3 rounded-xl drop-shadow max-w-lg mr-4">
                    <div className="leading-relaxed wrap-break-word whitespace-pre-wrap">
                      {data.text}
                    </div>
                  </div>
                </div>
              ) : data.type === "next-task" ? (
                <div className="flex items-end mb-4">
                  <div className="bg-gray-50 p-3 rounded-xl drop-shadow max-w-lg ml-4">
                    <div className="leading-relaxed wrap-break-word whitespace-pre-wrap">
                      {data.text}
                    </div>
                  </div>
                </div>
              ) : data.type === "mcp-search-result" ? (
                <div className="mb-4">
                  <div className="flex items-end mb-4">
                    <div className="bg-gray-50 p-3 rounded-xl drop-shadow max-w-lg ml-4">
                      <div className="leading-relaxed wrap-break-word whitespace-pre-wrap">
                        {data.text}
                      </div>
                    </div>
                  </div>
                  {data.mcpCandidates && data.mcpCandidates.length > 0 && (
                    <div className="px-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {data.mcpCandidates.map((candidate, idx) => (
                        <MCPCard key={idx} candidate={candidate} />
                      ))}
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
              <div className="flex items-center justify-center my-3">
                <div className="px-5 py-2 text-white bg-blue-500 rounded-full animate-pulse">
                  Thinking...
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>
      </div>

      <div>
        <div className="mb-3 grid grid-cols-12 gap-3">
          <div className="col-span-1">
            {/* ループ回数入力 */}
            <input
              className="w-full border rounded-lg py-2 px-3 focus:outline-none bg-gray-50 focus:bg-white"
              type="number"
              ref={iterationRef}
              id="iteration"
              defaultValue={5}
              disabled={loading}
            />
          </div>
          <div className="col-span-11 relative">
            {/* 目的入力 */}
            <textarea
              className="w-full border rounded-lg py-2 px-3 focus:outline-none bg-gray-50 focus:bg-white"
              rows={1}
              placeholder="Your objective..."
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
        </div>
        <div className="flex items-center justify-center space-x-5">
          {/* スタート */}
          <button
            className={`p-3 border rounded-lg w-32 text-white font-bold ${
              loading ? "bg-gray-500" : "bg-blue-500"
            }`}
            onClick={startHandler}
            disabled={loading}
          >
            Start
          </button>
          {/* ストップ */}
          <button
            className={`p-3 border rounded-lg w-32 text-white font-bold ${
              loading ? "bg-red-500" : "bg-gray-500"
            }`}
            onClick={stopHandler}
            disabled={!loading}
          >
            Stop
          </button>
        </div>
      </div>
    </div>
  );
};

export default Main;
