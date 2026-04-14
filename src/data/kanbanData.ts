import type { BoardColumn } from "./mockData";

/** Column definitions for the Kanban board. Task rows are stored via the aiTasks API only. */
export const boardColumns: BoardColumn[] = [
  { id: "col-todo", name: "To Do", color: "#ef4444", position: 0 },
  { id: "col-doing", name: "Doing", color: "#f59e0b", position: 1 },
  { id: "col-needs-input", name: "Needs Input", color: "#a855f7", position: 2 },
  { id: "col-done", name: "Done", color: "#22c55e", position: 3 },
  { id: "col-canceled", name: "Canceled", color: "#6b7280", position: 4 },
];
