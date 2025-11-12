"use client";

import axios, { CancelTokenSource } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageType, TaskType } from "./types";

const Main = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<MessageType[]>([]);
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
          <div className="col-span-11">
            {/* 目的入力 */}
            <textarea
              className="w-full border rounded-lg py-2 px-3 focus:outline-none bg-gray-50 focus:bg-white"
              rows={1}
              placeholder="Your objective..."
              ref={objectiveRef}
              disabled={loading}
              id="objective"
            />
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
