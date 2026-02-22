import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
} from "date-fns";

export {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
  addMonths,
  subMonths,
};

export const EVENT_COLORS: Record<string, string> = {
  cron: "#6366f1",
  scheduled: "#3b82f6",
  reminder: "#f59e0b",
  meeting: "#10b981",
  deadline: "#ef4444",
};

export const EVENT_ICONS: Record<string, string> = {
  cron: "⚙️",
  scheduled: "📅",
  reminder: "🔔",
  meeting: "👥",
  deadline: "🚨",
};

export const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/20 text-emerald-400",
  paused: "bg-amber-500/20 text-amber-400",
  completed: "bg-slate-500/20 text-slate-400 line-through",
  cancelled: "bg-red-500/20 text-red-400 line-through",
};

export const ASSIGNEE_AVATAR: Record<string, { emoji: string; label: string }> = {
  kevin: { emoji: "👤", label: "Kevin" },
  carrie: { emoji: "🐾", label: "Carrie" },
  both: { emoji: "👥", label: "Both" },
};
