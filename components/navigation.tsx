import Link from "next/link";

export const Navigation = () => {
  return (
    <header className="border-b border-neutral-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 group"
          >
            <div className="relative">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white rounded-sm"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-lg tracking-tight text-neutral-900">
                MCP Marketplace
              </span>
              <span className="text-xs text-neutral-500 hidden sm:block">
                Central Market for MCP Servers
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <button className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors hidden sm:block">
              Docs
            </button>
            <button className="text-sm bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition-colors">
              Publish
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
