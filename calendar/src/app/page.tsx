"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { format, addMonths, subMonths } from "@/lib/utils";
import CalendarGrid from "@/components/CalendarGrid";
import Sidebar from "@/components/Sidebar";
import EventModal from "@/components/EventModal";
import { ChevronLeft, ChevronRight, Calendar, Zap, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);

  const events = useQuery(api.events.listAll);
  const seed = useMutation(api.events.seed);

  // Seed on first load if empty
  useEffect(() => {
    if (events && events.length === 0) {
      seed();
    }
  }, [events, seed]);

  const handlePrev = () => setCurrentMonth((m) => subMonths(m, 1));
  const handleNext = () => setCurrentMonth((m) => addMonths(m, 1));
  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleSelectEvent = useCallback((event: any) => {
    setEditingEvent(event);
    setModalOpen(true);
  }, []);

  const handleNewEvent = useCallback(() => {
    setEditingEvent(null);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingEvent(null);
  }, []);

  // Stats
  const activeCount = events?.filter((e) => e.status === "active").length || 0;
  const cronCount = events?.filter((e) => e.type === "cron" && e.status === "active").length || 0;

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 glass border-b border-[var(--border)] px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="text-[var(--accent)]" size={20} />
              <h1 className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Mission Control
              </h1>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                <ChevronLeft size={16} />
              </button>
              <motion.h2
                key={format(currentMonth, "yyyy-MM")}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold w-36 text-center"
              >
                {format(currentMonth, "MMMM yyyy")}
              </motion.h2>
              <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-[var(--bg-hover)] transition-colors">
                <ChevronRight size={16} />
              </button>
              <button
                onClick={handleToday}
                className="ml-2 px-3 py-1 rounded-lg text-xs font-medium border border-[var(--border)] hover:bg-[var(--bg-hover)] transition-colors"
              >
                Today
              </button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <Zap size={12} className="text-emerald-400" />
                {cronCount} cron jobs
              </span>
              <span>{activeCount} active</span>
            </div>
            <button
              onClick={handleNewEvent}
              className="px-4 py-1.5 rounded-lg text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white transition-colors"
            >
              + Add Event
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Calendar */}
        <div className="flex-1 min-w-0">
          {!events ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="animate-spin text-[var(--accent)]" size={24} />
            </div>
          ) : (
            <CalendarGrid
              currentMonth={currentMonth}
              events={events as any}
              onSelectDate={handleSelectDate}
              onSelectEvent={handleSelectEvent}
              selectedDate={selectedDate}
            />
          )}
        </div>

        {/* Sidebar */}
        {events && (
          <Sidebar
            events={events as any}
            selectedDate={selectedDate}
            onSelectEvent={handleSelectEvent}
            onNewEvent={handleNewEvent}
          />
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <EventModal
          event={editingEvent}
          defaultDate={selectedDate || new Date()}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
