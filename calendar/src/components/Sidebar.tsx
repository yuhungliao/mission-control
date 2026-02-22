"use client";

import { format } from "@/lib/utils";
import { EVENT_ICONS, STATUS_STYLES, ASSIGNEE_AVATAR } from "@/lib/utils";
import { Clock, RotateCw, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Event {
  _id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  assignee: string;
  startTime: number;
  endTime?: number;
  allDay: boolean;
  recurring: boolean;
  cronExpression?: string;
  cronLabel?: string;
  color?: string;
  tags?: string[];
  lastRun?: number;
  nextRun?: number;
}

interface Props {
  events: Event[];
  selectedDate: Date | null;
  onSelectEvent: (event: Event) => void;
  onNewEvent: () => void;
}

export default function Sidebar({ events, selectedDate, onSelectEvent, onNewEvent }: Props) {
  // Show events for selected date, or upcoming events
  const filtered = selectedDate
    ? events.filter((e) => {
        const d = new Date(e.startTime);
        return (
          d.getFullYear() === selectedDate.getFullYear() &&
          d.getMonth() === selectedDate.getMonth() &&
          d.getDate() === selectedDate.getDate()
        );
      })
    : events
        .filter((e) => e.status === "active")
        .sort((a, b) => a.startTime - b.startTime)
        .slice(0, 10);

  const title = selectedDate
    ? format(selectedDate, "EEEE, MMM d")
    : "Upcoming";

  return (
    <div className="w-80 flex-shrink-0 glass rounded-2xl p-4 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
        <button
          onClick={onNewEvent}
          className="px-3 py-1 rounded-lg text-xs font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors"
        >
          + New
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2">
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-[var(--text-muted)] text-center py-8"
            >
              No events {selectedDate ? "on this day" : "upcoming"}
            </motion.p>
          )}
          {filtered.map((ev) => (
            <motion.div
              key={ev._id}
              layout
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              onClick={() => onSelectEvent(ev)}
              className="p-3 rounded-xl cursor-pointer hover:bg-[var(--bg-hover)] transition-all group"
              style={{ borderLeft: `3px solid ${ev.color || "#6366f1"}` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{EVENT_ICONS[ev.type]}</span>
                    <span className="text-sm font-medium truncate">{ev.title}</span>
                  </div>
                  {ev.description && (
                    <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 mb-1.5">
                      {ev.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 flex-wrap">
                    {!ev.allDay && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <Clock size={10} />
                        {format(new Date(ev.startTime), "h:mm a")}
                      </span>
                    )}
                    {ev.recurring && (
                      <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)]">
                        <RotateCw size={10} />
                        {ev.cronLabel || ev.cronExpression}
                      </span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_STYLES[ev.status]}`}>
                      {ev.status}
                    </span>
                    <span className="text-[10px]">
                      {ASSIGNEE_AVATAR[ev.assignee]?.emoji} {ASSIGNEE_AVATAR[ev.assignee]?.label}
                    </span>
                  </div>
                  {ev.tags && ev.tags.length > 0 && (
                    <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                      {ev.tags.map((tag) => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--bg-tertiary)] text-[var(--text-muted)]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
