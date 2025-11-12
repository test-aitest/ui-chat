"use client";

import { MCPCandidate } from "@/types/mcp";
import Image from "next/image";
import { useState } from "react";

interface MCPCardProps {
  candidate: MCPCandidate;
}

export default function MCPCard({ candidate }: MCPCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    setIsExecuting(true);
    // TODO: Implement execution logic
    setTimeout(() => setIsExecuting(false), 2000);
  };

  return (
    <div className="group border-2 border-gray-200 rounded-xl p-5 bg-white hover:border-blue-400 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-start gap-4 mb-4">
        <div className="shrink-0">
          {candidate.iconUrl ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden ring-2 ring-gray-100 group-hover:ring-blue-400 transition-all">
              <Image
                src={candidate.iconUrl}
                alt={candidate.title}
                width={48}
                height={48}
                className="object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-linear-to-br from-blue-500 to-blue-600 flex items-center justify-center ring-2 ring-gray-100 group-hover:ring-blue-400 transition-all">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
            {candidate.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {candidate.metaDescription}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 leading-relaxed line-clamp-3">
        {candidate.fullDescription}
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex-1 min-w-0 mr-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">Endpoint:</p>
          <p className="text-xs text-gray-700 truncate font-mono bg-gray-50 px-2 py-1 rounded">
            {candidate.endpoint}
          </p>
        </div>
        <button
          onClick={handleExecute}
          disabled={isExecuting}
          className="shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isExecuting ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Running</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Execute</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
