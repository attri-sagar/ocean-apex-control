import { useState } from "react";
import { motion } from "framer-motion";
import { tasks as initialTasks, Task } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const columns = [
  { id: "todo" as const, label: "To Do", color: "text-muted-foreground" },
  { id: "doing" as const, label: "Doing", color: "text-primary" },
  { id: "needs-input" as const, label: "Needs Input", color: "text-amber" },
  { id: "done" as const, label: "Done", color: "text-emerald" },
];

const priorityDot: Record<string, string> = {
  low: "bg-muted-foreground",
  medium: "bg-primary",
  high: "bg-amber",
  urgent: "bg-destructive",
};

const TaskBoard = () => {
  const [taskList, setTaskList] = useState<Task[]>(initialTasks);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const handleDragStart = (id: string) => setDraggedId(id);

  const handleDrop = (columnId: Task["column"]) => {
    if (!draggedId) return;
    setTaskList((prev) =>
      prev.map((t) => (t.id === draggedId ? { ...t, column: columnId } : t))
    );
    setDraggedId(null);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 overflow-x-auto">
      {columns.map((col) => (
        <div
          key={col.id}
          className="glass-card p-4 min-w-[260px]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => handleDrop(col.id)}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${col.color}`}>{col.label}</h3>
            <span className="text-xs font-mono text-muted-foreground">
              {taskList.filter((t) => t.column === col.id).length}
            </span>
          </div>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2 pr-2">
              {taskList
                .filter((t) => t.column === col.id)
                .map((task, i) => (
                  <motion.div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-3 rounded-lg bg-secondary/40 border border-border/50 cursor-grab active:cursor-grabbing hover:scale-[1.02] transition-transform"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-foreground font-medium leading-snug">{task.title}</p>
                      <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${priorityDot[task.priority]}`} />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{task.agentEmoji} {task.agentName}</span>
                      {task.column === "doing" && (
                        <Badge variant="outline" className="text-xs font-mono border-primary/30 text-primary">
                          {task.progress}%
                        </Badge>
                      )}
                    </div>
                  </motion.div>
                ))}
            </div>
          </ScrollArea>
        </div>
      ))}
    </div>
  );
};

export default TaskBoard;
