export interface MCPCandidate {
  id: string;
  title: string;
  iconUrl: string;
  endpoint: string;
  metaDescription: string;
  fullDescription: string;
}

export interface ChatMessage {
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

export interface SearchRequest {
  message: string;
}

export interface SearchResponse {
  queryEcho: string;
  candidates: MCPCandidate[];
  llmAnswer: string;
}
