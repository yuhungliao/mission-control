"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { X } from "lucide-react";
import { EVENT_COLORS } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type EventType = "cron" | "scheduled" | "reminder" | "meeting" | "deadline";
type EventStatus = "active" | "paused" | "completed" | "cancelled";
type Assignee = "kevin" | "carrie" | "both";

interface EventData {
  _id: Id<"events">;
  title: string;
  description?: string;
  type: EventType;
  status: EventStatus;
  assignee: Assignee;
  startTime: number;
  endTime?: number;
  allDay: boolean;
  recurring: boolean;
  cronExpression?: string;
  cronLabel?: string;
  color?: string;
  tags?: string[];
  nextRun?: number;
}

interface Props {
  event?: EventData | null;
  defaultDate?: Date;
  onClose: () => void;
}

export default function EventModal({ event, defaultDate, onClose }: Props) {
  const create = useMutation(api.events.create);
  const update = useMutation(api.events.update);
  const remove = useMutation(api.events.remove);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<EventType>("scheduled");
  const [status, setStatus] = useState<EventStatus>("active");
  const [assignee, setAssignee] = useState<Assignee>("carrie");
  const [startDate, setStartDate] = useState("");
  const [startTimeStr, setStartTimeStr] = useState("09:00");
  const [endDate, setEndDate] = useState("");
  const [endTimeStr, setEndTimeStr] = useState("10:00");
  const [allDay, setAllDay] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [cronExpression, setCronExpression] = useState("");
  const [cronLabel, setCronLabel] = useState("");
  const [tagsStr, setTagsStr] = useState("");

  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description || "");
      setType(event.type);
      setStatus(event.status);
      setAssignee(event.assignee);
      const sd = new Date(event.startTime);
      setStartDate(sd.toISOString().slice(0, 10));
      setStartTimeStr(sd.toTimeString().slice(0, 5));
      if (event.endTime) {
        const ed = new Date(event.endTime);
        setEndDate(ed.toISOString().slice(0, 10));
        setEndTimeStr(ed.toTimeString().slice(0, 5));
      }
      setAllDay(event.allDay);
      setRecurring(event.recurring);
      setCronExpression(event.cronExpression || "");
      setCronLabel(event.cronLabel || "");
      setTagsStr((event.tags || []).join(", "));
    } else if (defaultDate) {
      setStartDate(defaultDate.toISOString().slice(0, 10));
      setEndDate(defaultDate.toISOString().slice(0, 10));
    }
  }, [event, defaultDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const startTime = allDay
      ? new Date(startDate + "T00:00:00").getTime()
      : new Date(startDate + "T" + startTimeStr).getTime();
    const endTime =
      endDate
        ? allDay
          ? new Date(endDate + "T23:59:59").getTime()
          : new Date(endDate + "T" + endTimeStr).getTime()
        : undefined;

    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const data = {
      title,
      description: description || undefined,
      type,
      status,
      assignee,
      startTime,
      endTime,
      allDay,
      recurring,
      cronExpression: cronExpression || undefined,
      cronLabel: cronLabel || undefined,
      color: EVENT_COLORS[type],
      tags: tags.length ? tags : undefined,
    };

    if (event) {
      await update({ id: event._id, ...data });
    } else {
      await create(data);
    }
    onClose();
  };

  const handleDelete = async () => {
    if (event && confirm("Delete this event?")) {
      await remove({ id: event._id });
      onClose();
    }
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] transition-colors text-sm";
  const labelClass = "block text-xs font-medium text-[var(--text-secondary)] mb-1";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="glass rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold">
              {event ? "Edit Event" : "New Event"}
            </h2>
            <button onClick={onClose} className="p-1 hover:bg-[var(--bg-hover)] rounded-lg transition-colors">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelClass}>Title</label>
              <input className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className={labelClass}>Description</label>
              <textarea className={inputClass} rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className={labelClass}>Type</label>
                <select className={inputClass} value={type} onChange={(e) => setType(e.target.value as EventType)}>
                  <option value="cron">⚙️ Cron</option>
                  <option value="scheduled">📅 Scheduled</option>
                  <option value="reminder">🔔 Reminder</option>
                  <option value="meeting">👥 Meeting</option>
                  <option value="deadline">🚨 Deadline</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Status</label>
                <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as EventStatus)}>
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Assignee</label>
                <select className={inputClass} value={assignee} onChange={(e) => setAssignee(e.target.value as Assignee)}>
                  <option value="carrie">🐾 Carrie</option>
                  <option value="kevin">👤 Kevin</option>
                  <option value="both">👥 Both</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={allDay} onChange={(e) => setAllDay(e.target.checked)}
                  className="rounded border-[var(--border)] accent-[var(--accent)]" />
                All day
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)}
                  className="rounded border-[var(--border)] accent-[var(--accent)]" />
                Recurring
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Start Date</label>
                <input type="date" className={inputClass} value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
              </div>
              {!allDay && (
                <div>
                  <label className={labelClass}>Start Time</label>
                  <input type="time" className={inputClass} value={startTimeStr} onChange={(e) => setStartTimeStr(e.target.value)} />
                </div>
              )}
              <div>
                <label className={labelClass}>End Date</label>
                <input type="date" className={inputClass} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              {!allDay && (
                <div>
                  <label className={labelClass}>End Time</label>
                  <input type="time" className={inputClass} value={endTimeStr} onChange={(e) => setEndTimeStr(e.target.value)} />
                </div>
              )}
            </div>

            {recurring && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelClass}>Cron Expression</label>
                  <input className={inputClass} value={cronExpression} onChange={(e) => setCronExpression(e.target.value)}
                    placeholder="*/30 * * * *" />
                </div>
                <div>
                  <label className={labelClass}>Human Label</label>
                  <input className={inputClass} value={cronLabel} onChange={(e) => setCronLabel(e.target.value)}
                    placeholder="Every 30 minutes" />
                </div>
              </div>
            )}

            <div>
              <label className={labelClass}>Tags (comma-separated)</label>
              <input className={inputClass} value={tagsStr} onChange={(e) => setTagsStr(e.target.value)}
                placeholder="system, monitoring" />
            </div>

            <div className="flex items-center justify-between pt-2">
              {event && (
                <button type="button" onClick={handleDelete}
                  className="px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors">
                  Delete
                </button>
              )}
              <div className="flex gap-2 ml-auto">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="px-5 py-2 rounded-lg text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors">
                  {event ? "Save" : "Create"}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
