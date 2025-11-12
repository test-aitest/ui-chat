import { SlashCommand } from "@/types/commands";

interface CommandSuggestionProps {
  commands: SlashCommand[];
  selectedIndex: number;
  onSelect: (command: string) => void;
}

export default function CommandSuggestion({
  commands,
  selectedIndex,
  onSelect,
}: CommandSuggestionProps) {
  if (commands.length === 0) return null;

  return (
    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border rounded-lg shadow-lg overflow-hidden">
      {commands.map((cmd, index) => (
        <div
          key={cmd.command}
          className={`px-4 py-3 cursor-pointer transition-colors ${
            index === selectedIndex
              ? "bg-blue-500 text-white"
              : "hover:bg-gray-100"
          }`}
          onClick={() => onSelect(cmd.command)}
        >
          <div className="font-semibold text-sm">{cmd.usage}</div>
          <div
            className={`text-xs mt-1 ${
              index === selectedIndex ? "text-blue-100" : "text-gray-500"
            }`}
          >
            {cmd.description}
          </div>
        </div>
      ))}
    </div>
  );
}
