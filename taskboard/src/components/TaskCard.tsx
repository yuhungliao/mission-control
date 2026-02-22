"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion } from "framer-motion";
import { Trash2, GripVertical, Clock, User, AlertTriangle, Pencil } from "lucide-react";
import { useState } from "react";

const priorityConfig = {
  urgent: { color: "bg-rose-500/20 text-rose-400 border-rose-500/30", icon: "🔴", label: "Urgent" },
  high: { color: "bg-amber-500/20 text-amber-400 border-amber-500/30", icon: "🟠", label: "High" },
  medium: { color: "bg-blue-500/20 text-blue-400 border-blue-500/30", icon: "🔵", label: "Medium" },
  low: { color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", icon: "🟢", label: "Low" },
};

const assigneeConfig = {
  kevin: { avatar: "👤", name: "Kevin", color: "bg-blue-600" },
  carrie: { avatar: "🐾", name: "Carrie", color: "bg-purple-600" },
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

export default function TaskCard({ task, onEdit }: { task: Task; onEdit: (task: Task) => void }) {
  const remove = useMutation(api.tasks.remove);
  const [showConfirm, setShowConfirm] = useState(false);
  const priority = priorityConfig[task.priority];
  const assignee = assigneeConfig[task.assignee as keyof typeof assigneeConfig] || { avatar: "🤖", name: task.assignee || "Unknown", color: "bg-slate-600" };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="group relative rounded-xl p-4 cursor-grab active:cursor-grabbing card-glow transition-all duration-200"
      style={{
        background: "linear-gradient(135deg, rgba(22, 33, 62, 0.8), rgba(26, 26, 46, 0.9))",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Drag handle */}
      <div className="absolute top-3 left-1 opacity-0 group-hover:opacity-40 transition-opacity">
        <GripVertical size={14} />
      </div>

      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(task)}
          className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Pencil size={13} className="text-slate-400" />
        </button>
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="p-1.5 rounded-lg hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 size={13} className="text-slate-400 hover:text-rose-400" />
          </button>
        ) : (
          <button
            onClick={() => remove({ id: task._id })}
            className="px-2 py-1 rounded-lg bg-rose-500/20 text-rose-400 text-xs font-medium"
          >
            Delete?
          </button>
        )}
      </div>

      {/* Priority badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${priority.color}`}>
          {priority.icon} {priority.label}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-slate-100 mb-1 pr-12 leading-snug">
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-400 border border-white/5"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
        <div className="flex items-center gap-1.5">
          <div className={`w-5 h-5 rounded-full ${assignee.color} flex items-center justify-center text-[10px]`}>
            {assignee.avatar}
          </div>
          <span className="text-[11px] text-slate-400">{assignee.name}</span>
        </div>
        {task.dueDate && (
          <div className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock size={11} />
            {task.dueDate}
          </div>
        )}
      </div>
    </motion.div>
  );
}
