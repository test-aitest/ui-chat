import { NextRequest, NextResponse } from "next/server";
import { SearchResponse, ChatMessage } from "@/types/mcp";
import axios from "axios";

const API_BASE_URL = "https://sample-server-production-74fc.up.railway.app";

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    // Call external API
    const apiResponse = await axios.post(`${API_BASE_URL}/search`, {
      message: query,
    });

    const data: SearchResponse = apiResponse.data;

    // Create agent response message
    const agentMessage: ChatMessage = {
      role: "agent",
      content: data.llmAnswer,
      timestamp: new Date(),
    };

    const response = {
      message: agentMessage,
      mcpCandidates: data.candidates,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API error:", error);

    if (axios.isAxiosError(error)) {
      return NextResponse.json(
        { error: error.response?.data?.message || "External API error" },
        { status: error.response?.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
