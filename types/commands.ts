export interface SlashCommand {
  command: string;
  description: string;
  usage: string;
}

export const slashCommands: SlashCommand[] = [
  {
    command: "/search",
    description: "Search for MCP candidates",
    usage: "/search ",
  },
];
