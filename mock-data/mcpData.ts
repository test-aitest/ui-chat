import { MCPCandidate } from "@/types/mcp";

export const mockMCPCandidates: MCPCandidate[] = [
  {
    id: "1",
    title: "Web Search API",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=search",
    endpoint: "https://api.example.com/search",
    metaDescription: "Search the web for relevant information",
    fullDescription:
      "A comprehensive web search API that provides access to real-time web data and search results.",
  },
  {
    id: "2",
    title: "Knowledge Base",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=knowledge",
    endpoint: "https://api.example.com/knowledge",
    metaDescription: "Access internal knowledge base",
    fullDescription:
      "Internal knowledge base system for quick access to company documentation and resources.",
  },
  {
    id: "3",
    title: "Database Query",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=database",
    endpoint: "https://api.example.com/database",
    metaDescription: "Query structured data from databases",
    fullDescription:
      "Execute queries against structured databases and retrieve organized data efficiently.",
  },
  {
    id: "4",
    title: "Document Parser",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=parser",
    endpoint: "https://api.example.com/parser",
    metaDescription: "Extract information from documents",
    fullDescription:
      "Parse and extract structured information from various document formats including PDF, DOCX, and more.",
  },
  {
    id: "5",
    title: "Translation Service",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=translate",
    endpoint: "https://api.example.com/translate",
    metaDescription: "Translate text between languages",
    fullDescription:
      "Multi-language translation service supporting over 100 languages with high accuracy.",
  },
  {
    id: "6",
    title: "Image Analysis",
    iconUrl: "https://api.dicebear.com/7.x/shapes/svg?seed=image",
    endpoint: "https://api.example.com/image",
    metaDescription: "Analyze and extract data from images",
    fullDescription:
      "Advanced image analysis using computer vision to extract text, objects, and insights from images.",
  },
];
