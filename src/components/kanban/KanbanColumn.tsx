import { Droppable, Draggable } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KanbanTask, BoardColumn } from "@/data/mockData";
import KanbanCard from "./KanbanCard";
import { InboxIcon } from "lucide-react";

interface KanbanColumnProps {
  column: BoardColumn;
  tasks: KanbanTask[];
  onTaskClick: (task: KanbanTask) => void;
}

export default function KanbanColumn({ column, tasks, onTaskClick }: KanbanColumnProps) {
  return (
    <div className="glass-card flex flex-col min-w-[280px] max-w-[320px] w-full flex-shrink-0">
      {/* Color bar */}
      <div className="h-1 rounded-t-xl" style={{ backgroundColor: column.color }} />

      {/* Header */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="text-sm font-semibold text-foreground">{column.name}</h3>
        </div>
        <span className="text-[10px] font-mono text-muted-foreground bg-secondary/40 px-2 py-0.5 rounded-md">
          {tasks.length}
        </span>
      </div>

      {/* Droppable area */}
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <ScrollArea className="flex-1 px-3 pb-3">
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[120px] space-y-2 transition-colors duration-200 rounded-lg p-1 ${
                snapshot.isDraggingOver ? "bg-primary/5 ring-1 ring-primary/20" : ""
              }`}
            >
              {tasks.length === 0 && !snapshot.isDraggingOver && (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-muted-foreground/15 rounded-xl">
                  <InboxIcon className="w-6 h-6 text-muted-foreground/30 mb-2" />
                  <span className="text-[10px] text-muted-foreground/40">No tasks</span>
                </div>
              )}
              {tasks.map((task, index) => (
                <Draggable key={task.id} draggableId={task.id} index={index}>
                  {(dragProvided) => (
                    <div
                      ref={dragProvided.innerRef}
                      {...dragProvided.draggableProps}
                      {...dragProvided.dragHandleProps}
                    >
                      <KanbanCard task={task} index={index} onClick={() => onTaskClick(task)} />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          </ScrollArea>
        )}
      </Droppable>
    </div>
  );
}
