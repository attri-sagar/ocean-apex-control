import { motion } from "framer-motion";
import { Calendar, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { KanbanTask } from "@/data/mockData";

const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
  urgent: { bg: "bg-destructive/20 border-destructive/30", text: "text-destructive", label: "Urgent" },
  high: { bg: "bg-amber/20 border-amber/30", text: "text-amber", label: "High" },
  medium: { bg: "bg-primary/20 border-primary/30", text: "text-primary", label: "Medium" },
  low: { bg: "bg-muted/40 border-muted-foreground/20", text: "text-muted-foreground", label: "Low" },
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date("2026-04-13");
}

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date("2026-04-13");
  const diffMs = date.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`;
  return `In ${diffDays}d`;
}

interface KanbanCardProps {
  task: KanbanTask;
  index: number;
  onClick: () => void;
}

export default function KanbanCard({ task, index, onClick }: KanbanCardProps) {
  const priority = priorityStyles[task.priority];
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const overdue = isOverdue(task.dueDate);
  const maxAvatars = 3;
  const overflow = task.assignees.length - maxAvatars;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      onClick={onClick}
      className="group p-3.5 rounded-xl glass-card-inner cursor-pointer transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(14,165,233,0.08)] hover:border-primary/20"
    >
      {/* Title + Priority */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-xs font-semibold text-foreground leading-snug line-clamp-2 flex-1">{task.title}</h4>
        <Badge variant="outline" className={`text-[9px] px-1.5 py-0 h-4 shrink-0 border ${priority.bg} ${priority.text}`}>
          {priority.label}
        </Badge>
      </div>

      {/* Description preview */}
      <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2 mb-2.5">{task.description}</p>

      {/* Subtask progress */}
      {totalSubtasks > 0 && (
        <div className="mb-2.5">
          <div className="flex items-center justify-between text-[9px] mb-1">
            <span className="text-muted-foreground">{completedSubtasks}/{totalSubtasks} subtasks</span>
            <span className="text-muted-foreground font-mono">{Math.round((completedSubtasks / totalSubtasks) * 100)}%</span>
          </div>
          <div className="h-1 rounded-full bg-secondary/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-primary/70 transition-all duration-500"
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer: assignees + due date */}
      <div className="flex items-center justify-between">
        {/* Assignees */}
        <div className="flex items-center -space-x-1.5">
          {task.assignees.length === 0 && (
            <div className="w-5 h-5 rounded-full bg-secondary/60 flex items-center justify-center">
              <span className="text-[8px] text-muted-foreground">?</span>
            </div>
          )}
          {task.assignees.slice(0, maxAvatars).map((a) => (
            <div
              key={a.id}
              title={a.displayName}
              className="w-5 h-5 rounded-full flex items-center justify-center text-[7px] font-bold text-white ring-1 ring-background"
              style={{ backgroundColor: a.color }}
            >
              {getInitials(a.displayName)}
            </div>
          ))}
          {overflow > 0 && (
            <div className="w-5 h-5 rounded-full bg-secondary/80 flex items-center justify-center text-[7px] font-mono text-muted-foreground ring-1 ring-background">
              +{overflow}
            </div>
          )}
        </div>

        {/* Due date */}
        {task.dueDate && (
          <div className={`flex items-center gap-1 text-[9px] ${overdue ? "text-destructive" : "text-muted-foreground"}`}>
            {overdue && <AlertTriangle className="w-2.5 h-2.5" />}
            <Calendar className="w-2.5 h-2.5" />
            <span className="font-mono">{formatRelativeDate(task.dueDate)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
