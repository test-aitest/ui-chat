import { NextRequest, NextResponse } from "next/server";
import { TaskType } from "@/components/types";
import { OpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

export async function POST(req: NextRequest) {
  try {
    const { objective, taskList, task, result } = await req.json();

    const llm = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      temperature: 0.3,
    });

    const template =
      "You are an AI task creation agent. You have the following objective `{objective}`. You have the following incomplete tasks `{tasks}` and have just executed the following task `{lastTask}` and received the following result `{result}`. Based on this, create a new task to be completed by your AI system such that your goal is more closely reached or completely reached. Return the result as a numbered list, like: #. First task #. Second task. Start the task list with number {nextTaskID}.";

    const prompt = new PromptTemplate({
      template,
      inputVariables: [
        "objective",
        "tasks",
        "lastTask",
        "result",
        "nextTaskID",
      ],
    });

    const chain = prompt.pipe(llm);

    const taskNamesString = taskList
      .map((task: TaskType) => task.taskName)
      .join(", ");

    const nextTaskID = (Number(task.taskID) + 1).toString();

    const responseTaskCreate = await chain.invoke({
      objective,
      tasks: taskNamesString,
      lastTask: task.taskName,
      result,
      nextTaskID,
    });

    const resultTaskCreate = responseTaskCreate;

    const newPrioritizeTaskList = [];
    for (const newPrioritizeTask of resultTaskCreate.split("\n")) {
      const taskParts = newPrioritizeTask.trim().split(". ", 2);
      if (taskParts.length === 2) {
        const taskID = taskParts[0].trim();
        const taskName = taskParts[1].trim();
        newPrioritizeTaskList.push({ taskID, taskName });
      }
    }
    return NextResponse.json({ response: newPrioritizeTaskList });
  } catch (error) {
    console.log("error", error);
    return NextResponse.error();
  }
}
