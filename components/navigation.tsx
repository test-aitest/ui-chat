import Link from "next/link";

export const Navigation = () => {
  return (
    <header className="border-b bg-linear-to-r from-blue-600 to-blue-700 shadow-md">
      <div className="container max-w-7xl mx-auto px-3 sm:px-5 py-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <Link
            href="/"
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group"
          >
            <div className="bg-white rounded-lg p-2 group-hover:scale-110 transition-transform">
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </div>
            <span className="font-bold text-xl sm:text-2xl text-white">
              MCP Marketplace
            </span>
          </Link>
          <div className="text-white text-xs sm:text-sm hidden md:block">
            <span className="opacity-80">Central Market for MCP Servers</span>
          </div>
        </div>
      </div>
    </header>
  );
};
