import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export async function POST(req: NextRequest) {
  try {
    // 目的とタスクを取得
    const { objective, task } = await req.json();

    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // プロンプト
    const chatPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        "You are an AI who performs one task based on the following objective: {objective}. Please answer in Japanese.",
      ],
      ["human", "Your task: {task}. Response:"],
    ]);

    // 実行
    const chain = chatPrompt.pipe(chat);
    const response = await chain.invoke({ objective, task });

    return NextResponse.json({ response: response.content });
  } catch (error) {
    console.log("error", error);
    return NextResponse.error();
  }
}
