import { MessageType } from "@/components/types";

export const TEST_MESSAGES: MessageType[] = [
  {
    type: "objective",
    text: "テスト目的",
  },
  {
    type: "task-list",
    text: "1. テストタスク1\n2. テストタスク2\n3. テストタスク3",
  },
  {
    type: "next-task",
    text: "1. テストタスク1",
  },
  {
    type: "task-result",
    text: "テストタスク1の結果",
  },
  {
    type: "next-task",
    text: "2. テストタスク2",
  },
  {
    type: "task-result",
    text: "テストタスク2の結果",
  },
];
