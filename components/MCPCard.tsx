import { MCPCandidate } from "@/types/mcp";
import Image from "next/image";

interface MCPCardProps {
  candidate: MCPCandidate;
}

export default function MCPCard({ candidate }: MCPCardProps) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        {candidate.iconUrl && (
          <Image
            src={candidate.iconUrl}
            alt={candidate.title}
            width={40}
            height={40}
            className="rounded"
          />
        )}
        <div className="flex-1">
          <h3 className="font-bold text-lg text-gray-800">{candidate.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{candidate.metaDescription}</p>
        </div>
      </div>
      <p className="text-xs text-gray-700 mb-3 leading-relaxed">
        {candidate.fullDescription}
      </p>
      <div className="text-xs text-gray-500 truncate">
        <span className="font-semibold">Endpoint:</span> {candidate.endpoint}
      </div>
    </div>
  );
}
