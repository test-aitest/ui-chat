import { NextRequest, NextResponse } from "next/server";
import { ChatOpenAI } from "@langchain/openai";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { createAgent } from "langchain";

export async function POST(req: NextRequest) {
  const tool = new SerpAPI(process.env.SERPAPI_API_KEY);
  const tools = [tool];

  try {
    const { objective, task } = await req.json();

    const chat = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    const agent = createAgent({
      model: chat,
      tools,
    });

    const input = `
      Objective: ${objective}
      Task: ${task}

      (Please answer in Japanese)
    `;

    const result = await agent.invoke({
      messages: [{ role: "user", content: input }],
    });

    const lastMessage = result.messages[result.messages.length - 1];
    const response = lastMessage.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.log("error", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
