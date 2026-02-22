"use client";

import { useMemo } from "react";
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
} from "@/lib/utils";
import { EVENT_ICONS, ASSIGNEE_AVATAR } from "@/lib/utils";
import { motion } from "framer-motion";

interface Event {
  _id: string;
  title: string;
  type: string;
  status: string;
  assignee: string;
  startTime: number;
  allDay: boolean;
  recurring: boolean;
  cronLabel?: string;
  color?: string;
}

interface Props {
  currentMonth: Date;
  events: Event[];
  onSelectDate: (date: Date) => void;
  onSelectEvent: (event: Event) => void;
  selectedDate: Date | null;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarGrid({
  currentMonth,
  events,
  onSelectDate,
  onSelectEvent,
  selectedDate,
}: Props) {
  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  }, [currentMonth]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Event[]>();
    for (const ev of events) {
      const key = format(new Date(ev.startTime), "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  return (
    <div className="animate-fade-in">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-[var(--text-muted)] py-2">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-px bg-[var(--border)] rounded-xl overflow-hidden">
        {days.map((day, i) => {
          const key = format(day, "yyyy-MM-dd");
          const dayEvents = eventsByDay.get(key) || [];
          const inMonth = isSameMonth(day, currentMonth);
          const today = isToday(day);
          const selected = selectedDate && isSameDay(day, selectedDate);

          return (
            <motion.div
              key={key}
              whileHover={{ scale: 1.02 }}
              className={`
                min-h-[100px] p-1.5 cursor-pointer transition-colors
                ${inMonth ? "bg-[var(--bg-secondary)]" : "bg-[var(--bg-primary)]"}
                ${selected ? "ring-2 ring-[var(--accent)] ring-inset" : ""}
                ${today ? "bg-[var(--accent)]/5" : ""}
              `}
              onClick={() => onSelectDate(day)}
            >
              <div className={`text-right text-xs mb-1 ${
                today
                  ? "font-bold text-[var(--accent)]"
                  : inMonth
                  ? "text-[var(--text-secondary)]"
                  : "text-[var(--text-muted)] opacity-40"
              }`}>
                {today && <span className="inline-block w-5 h-5 leading-5 text-center rounded-full bg-[var(--accent)] text-white mr-0.5">
                  {format(day, "d")}
                </span>}
                {!today && format(day, "d")}
              </div>
              <div className="space-y-0.5">
                {dayEvents.slice(0, 3).map((ev) => (
                  <div
                    key={ev._id}
                    onClick={(e) => { e.stopPropagation(); onSelectEvent(ev); }}
                    className="flex items-center gap-1 px-1 py-0.5 rounded text-[10px] leading-tight truncate cursor-pointer hover:brightness-125 transition-all"
                    style={{ backgroundColor: (ev.color || "#6366f1") + "25", color: ev.color || "#6366f1" }}
                  >
                    <span>{EVENT_ICONS[ev.type] || "📅"}</span>
                    <span className="truncate font-medium">{ev.title}</span>
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-[10px] text-[var(--text-muted)] pl-1">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
