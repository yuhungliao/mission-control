"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
} | null;

export default function TaskModal({
  open,
  onClose,
  editTask,
  defaultStatus,
}: {
  open: boolean;
  onClose: () => void;
  editTask?: Task;
  defaultStatus?: string;
}) {
  const create = useMutation(api.tasks.create);
  const update = useMutation(api.tasks.update);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"backlog" | "todo" | "in_progress" | "review" | "done">("todo");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [assignee, setAssignee] = useState<"kevin" | "carrie">("kevin");
  const [tagsInput, setTagsInput] = useState("");
  const [dueDate, setDueDate] = useState("");

  useEffect(() => {
    if (editTask) {
      setTitle(editTask.title);
      setDescription(editTask.description || "");
      setStatus(editTask.status as any);
      setPriority(editTask.priority);
      setAssignee(editTask.assignee);
      setTagsInput(editTask.tags?.join(", ") || "");
      setDueDate(editTask.dueDate || "");
    } else {
      setTitle("");
      setDescription("");
      setStatus((defaultStatus as any) || "todo");
      setPriority("medium");
      setAssignee("kevin");
      setTagsInput("");
      setDueDate("");
    }
  }, [editTask, defaultStatus, open]);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    if (editTask) {
      await update({
        id: editTask._id,
        title,
        description: description || undefined,
        status,
        priority,
        assignee,
        tags: tags.length > 0 ? tags : undefined,
        dueDate: dueDate || undefined,
      });
    } else {
      await create({
        title,
        description: description || undefined,
        status,
        priority,
        assignee,
        tags: tags.length > 0 ? tags : undefined,
        dueDate: dueDate || undefined,
      });
    }
    onClose();
  };

  const selectClass =
    "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all appearance-none";
  const inputClass =
    "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #1a1a2e, #16213e)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h2 className="text-lg font-bold text-slate-100">
                {editTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Title *
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What needs to be done?"
                  className={inputClass}
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details..."
                  rows={3}
                  className={inputClass + " resize-none"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Status
                  </label>
                  <select value={status} onChange={(e) => setStatus(e.target.value as any)} className={selectClass}>
                    <option value="backlog">📋 Backlog</option>
                    <option value="todo">📌 To Do</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="review">🔍 Review</option>
                    <option value="done">✅ Done</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Priority
                  </label>
                  <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className={selectClass}>
                    <option value="urgent">🔴 Urgent</option>
                    <option value="high">🟠 High</option>
                    <option value="medium">🔵 Medium</option>
                    <option value="low">🟢 Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Assignee
                  </label>
                  <select value={assignee} onChange={(e) => setAssignee(e.target.value as any)} className={selectClass}>
                    <option value="kevin">👤 Kevin</option>
                    <option value="carrie">🐾 Carrie</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">
                  Tags (comma separated)
                </label>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="security, openclaw, finance..."
                  className={inputClass}
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-white/5">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {editTask ? "Save Changes" : "Create Task"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
