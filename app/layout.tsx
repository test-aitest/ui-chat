import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "MCP Marketplace - Central Market for MCP Servers",
  description:
    "AI Agent による「MCP Server検索＆実行統合システム」- 自然言語でMCPサーバーを探索・実行",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <Navigation />
          <main className="flex-1 container max-w-7xl mx-auto px-3 sm:px-5 py-3 sm:py-5">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
