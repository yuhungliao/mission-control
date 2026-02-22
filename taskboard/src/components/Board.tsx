"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { DndContext, DragEndEvent, DragOverEvent, PointerSensor, useSensor, useSensors, DragOverlay, DragStartEvent } from "@dnd-kit/core";
import Column from "./Column";
import TaskModal from "./TaskModal";
import TaskCard from "./TaskCard";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, LayoutGrid, Filter } from "lucide-react";

const COLUMNS = ["backlog", "todo", "in_progress", "review", "done"];

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

export default function Board() {
  const tasks = useQuery(api.tasks.list) as Task[] | undefined;
  const moveTask = useMutation(api.tasks.moveTask);
  const seedTasks = useMutation(api.tasks.seed);

  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<string>("todo");
  const [filterAssignee, setFilterAssignee] = useState<string>("all");
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Seed on first load
  useEffect(() => {
    if (tasks && tasks.length === 0) {
      seedTasks();
    }
  }, [tasks, seedTasks]);

  const handleAddTask = (status: string) => {
    setEditTask(null);
    setDefaultStatus(status);
    setModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditTask(task);
    setModalOpen(true);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks?.find((t) => t._id === event.active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    const { active, over } = event;
    if (!over || !tasks) return;

    const taskId = active.id as Id<"tasks">;
    const task = tasks.find((t) => t._id === taskId);
    if (!task) return;

    // Determine target column
    let targetStatus: string;
    const overTask = tasks.find((t) => t._id === over.id);
    if (overTask) {
      targetStatus = overTask.status;
    } else if (COLUMNS.includes(over.id as string)) {
      targetStatus = over.id as string;
    } else {
      return;
    }

    const targetTasks = tasks.filter((t) => t.status === targetStatus && t._id !== taskId);
    const maxOrder = targetTasks.reduce((max, t) => Math.max(max, t.order), -1);

    await moveTask({
      id: taskId,
      newStatus: targetStatus as any,
      newOrder: maxOrder + 1,
    });
  };

  const filteredTasks = tasks?.filter(
    (t) => filterAssignee === "all" || t.assignee === filterAssignee
  );

  const tasksByStatus = (status: string) =>
    filteredTasks?.filter((t) => t.status === status) || [];

  const stats = {
    total: tasks?.length || 0,
    kevin: tasks?.filter((t) => t.assignee === "kevin").length || 0,
    carrie: tasks?.filter((t) => t.assignee === "carrie").length || 0,
    done: tasks?.filter((t) => t.status === "done").length || 0,
  };

  if (!tasks) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Loading board...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 glass">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-lg font-bold">
                  T
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white tracking-tight">TaskBoard</h1>
                  <p className="text-xs text-slate-500">Kevin & Carrie 🐾</p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="hidden md:flex items-center gap-2 ml-6">
                <span className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-slate-400 border border-white/5">
                  {stats.total} tasks
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  ✅ {stats.done} done
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  👤 Kevin: {stats.kevin}
                </span>
                <span className="text-xs px-3 py-1.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  🐾 Carrie: {stats.carrie}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/5">
                {["all", "kevin", "carrie"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterAssignee(f)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      filterAssignee === f
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {f === "all" ? "All" : f === "kevin" ? "👤 Kevin" : "🐾 Carrie"}
                  </button>
                ))}
              </div>

              {/* New task */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAddTask("todo")}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
              >
                <Plus size={16} />
                New Task
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 overflow-x-auto p-6">
        <div className="max-w-[1800px] mx-auto">
          <DndContext
            sensors={sensors}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-5">
              {COLUMNS.map((status) => (
                <Column
                  key={status}
                  status={status}
                  tasks={tasksByStatus(status)}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                />
              ))}
            </div>

            <DragOverlay>
              {activeTask ? (
                <div className="rotate-3 opacity-90">
                  <TaskCard task={activeTask} onEdit={() => {}} />
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        </div>
      </main>

      {/* Modal */}
      <TaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTask(null);
        }}
        editTask={editTask}
        defaultStatus={defaultStatus}
      />
    </div>
  );
}
