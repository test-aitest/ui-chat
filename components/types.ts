import { MCPCandidate } from "@/types/mcp";

export type MessageType = {
  text: string;
  type: string;
  mcpCandidates?: MCPCandidate[];
};

export type TaskType = {
  taskID: string;
  taskName: string;
};
