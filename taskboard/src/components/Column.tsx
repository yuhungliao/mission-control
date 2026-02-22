"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TaskCard from "./TaskCard";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

const statusConfig: Record<string, { label: string; emoji: string; gradient: string; dotColor: string }> = {
  backlog: { label: "Backlog", emoji: "📋", gradient: "from-slate-500/20 to-slate-600/10", dotColor: "bg-slate-400" },
  todo: { label: "To Do", emoji: "📌", gradient: "from-blue-500/20 to-blue-600/10", dotColor: "bg-blue-400" },
  in_progress: { label: "In Progress", emoji: "⚡", gradient: "from-amber-500/20 to-amber-600/10", dotColor: "bg-amber-400" },
  review: { label: "Review", emoji: "🔍", gradient: "from-purple-500/20 to-purple-600/10", dotColor: "bg-purple-400" },
  done: { label: "Done", emoji: "✅", gradient: "from-emerald-500/20 to-emerald-600/10", dotColor: "bg-emerald-400" },
};

type Task = {
  _id: Id<"tasks">;
  title: string;
  description?: string;
  status: string;
  priority: "low" | "medium" | "high" | "urgent";
  assignee: "kevin" | "carrie";
  tags?: string[];
  dueDate?: string;
  order: number;
  createdAt: number;
  updatedAt: number;
};

function SortableTaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} onEdit={onEdit} />
    </div>
  );
}

export default function Column({
  status,
  tasks,
  onAddTask,
  onEditTask,
}: {
  status: string;
  tasks: Task[];
  onAddTask: (status: string) => void;
  onEditTask: (task: Task) => void;
}) {
  const config = statusConfig[status] || statusConfig.todo;
  const { setNodeRef, isOver } = useDroppable({ id: status });

  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col min-w-[300px] max-w-[340px] w-full"
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between mb-4 px-1`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${config.dotColor}`} />
          <h2 className="text-sm font-bold text-slate-200 tracking-wide uppercase">
            {config.label}
          </h2>
          <span className="text-xs font-medium text-slate-500 bg-white/5 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={() => onAddTask(status)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-slate-400 hover:text-slate-200"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-2 rounded-2xl min-h-[200px] transition-all duration-200 ${
          isOver
            ? "bg-blue-500/10 border-2 border-dashed border-blue-500/30 scale-[1.01]"
            : "bg-white/[0.02] border-2 border-transparent"
        }`}
      >
        <SortableContext items={sortedTasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <SortableTaskCard key={task._id} task={task} onEdit={onEditTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && !isOver && (
          <div className="flex flex-col items-center justify-center h-32 text-slate-600">
            <span className="text-2xl mb-2">{config.emoji}</span>
            <span className="text-xs">No tasks</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
