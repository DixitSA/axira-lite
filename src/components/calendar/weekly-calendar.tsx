"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils/format";
import { STATUS_COLORS, CALENDAR_LEGEND_ITEMS } from "@/lib/utils/constants";

interface JobEvent {
  id: number;
  title: string;
  clientName: string;
  scheduledStart: Date;
  status: string;
}

interface WeeklyCalendarProps {
  jobs: JobEvent[];
}

function CalendarLegend() {
  return (
    <div className="flex items-center gap-3">
      {CALENDAR_LEGEND_ITEMS.map(({ label, dotClass }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${dotClass}`} aria-hidden="true" />
          <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function WeeklyCalendar({ jobs }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // FIX (optimize): memoize startDate so days/jobsByDay don't recompute on every render
  const startDate = useMemo(
    () => startOfWeek(currentDate, { weekStartsOn: 1 }),
    [currentDate]
  );

  const days = useMemo(
    () => Array.from({ length: 7 }).map((_, i) => addDays(startDate, i)),
    [startDate]
  );

  const nextWeek = useCallback(
    () => setCurrentDate((prev) => addDays(prev, 7)),
    []
  );
  const prevWeek = useCallback(
    () => setCurrentDate((prev) => addDays(prev, -7)),
    []
  );
  const goToday = useCallback(() => setCurrentDate(new Date()), []);

  // FIX (harden): removed border class from fallback; consistent neutral matches CANCELLED/DRAFT
  const getStatusColor = useCallback((status: string) => {
    return STATUS_COLORS[status] ?? "bg-gray-100 text-gray-600";
  }, []);

  const jobsByDay = useMemo(() => {
    const map = new Map<string, JobEvent[]>();
    days.forEach((day) => {
      const dayKey = day.toISOString().split("T")[0];
      const dayJobs = jobs
        .filter((j) => isSameDay(new Date(j.scheduledStart), day))
        .sort(
          (a, b) =>
            new Date(a.scheduledStart).getTime() -
            new Date(b.scheduledStart).getTime()
        );
      map.set(dayKey, dayJobs);
    });
    return map;
  }, [jobs, days]);

  const [todayStr, setTodayStr] = useState(
    () => new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    const now = new Date();
    const msUntilMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() -
      now.getTime();
    const timeout = setTimeout(() => {
      setTodayStr(new Date().toISOString().split("T")[0]);
    }, msUntilMidnight);
    return () => clearTimeout(timeout);
  }, [todayStr]);

  return (
    // FIX (adapt): replaced h-[calc(100vh-12rem)] with flex-1 min-h-0 — fills parent flex column
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col flex-1 min-h-[600px]">

      {/* Toolbar */}
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          {/* FIX (harden): aria-live so screen readers announce week changes on navigation */}
          <div aria-live="polite" aria-atomic="true">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">
              {format(startDate, "MMMM yyyy")}
            </h2>
          </div>
          {/* FIX (polish): removed shadow-sm — flat design, border is sufficient separation */}
          <div className="flex items-center rounded-md bg-white border border-gray-200 overflow-hidden">
            <button
              onClick={prevWeek}
              aria-label="Previous week"
              className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={goToday}
              aria-label="Go to today"
              className="px-3 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 border-x border-gray-200 transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
            >
              Today
            </button>
            <button
              onClick={nextWeek}
              aria-label="Next week"
              className="p-2.5 hover:bg-gray-50 text-gray-600 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        {/* FIX (distill): legend extracted to CalendarLegend; shown md+ in toolbar */}
        <div className="hidden md:block">
          <CalendarLegend />
        </div>
      </div>

      {/* FIX (distill): shared CalendarLegend component — no more duplicated markup */}
      {/* FIX (adapt): changed sm:hidden to md:hidden to match the grid breakpoint */}
      <div className="md:hidden px-3 py-2 border-b border-gray-100 flex-shrink-0">
        <CalendarLegend />
      </div>

      {/* Desktop: 7-column grid */}
      {/* FIX (adapt): changed sm: to md: — 7 cols at 640px (~91px each) is too cramped */}
      <div className="hidden md:grid md:grid-cols-7 md:flex-1 md:min-h-0 md:overflow-hidden">
        {days.map((day, i) => {
          const dayKey = day.toISOString().split("T")[0];
          const dayJobs = jobsByDay.get(dayKey) || [];
          const isToday = dayKey === todayStr;

          return (
            <div
              key={`desktop-col-${i}`}
              aria-current={isToday ? "date" : undefined}
              className={`border-r border-gray-100 p-2 overflow-y-auto last:border-r-0 ${isToday ? "bg-blue-50/50" : "bg-gray-50/30"}`}
            >
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center mb-1">
                {format(day, "EEE")}
              </div>
              <div
                className={`text-lg text-center ${isToday ? "font-bold text-blue-600" : "font-semibold text-gray-900"}`}
              >
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-2 mt-2">
                {dayJobs.map((job) => (
                  <Link
                    key={job.id}
                    href="/jobs"
                    className={`block p-2 rounded border ${getStatusColor(job.status)} hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1`}
                  >
                    <div className="text-[10px] font-bold tabular-nums uppercase opacity-80 mb-0.5">
                      {formatTime(job.scheduledStart)}
                    </div>
                    <div className="text-xs font-bold leading-tight mb-1 truncate">
                      {job.clientName}
                    </div>
                    <div className="text-[10px] font-medium opacity-90 truncate">
                      {job.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile: vertical stack */}
      {/* FIX (adapt): changed sm:hidden to md:hidden to match breakpoint */}
      <div className="md:hidden flex-1 min-h-0 overflow-y-auto">
        {days.map((day, i) => {
          const dayKey = day.toISOString().split("T")[0];
          const dayJobs = jobsByDay.get(dayKey) || [];
          const isToday = dayKey === todayStr;

          return (
            <div
              key={`mobile-day-${i}`}
              className="border-b border-gray-200 last:border-b-0"
            >
              {/* FIX (polish): replaced banned border-l-4 stripe with bg-blue-50 tint */}
              {/* FIX (harden): added aria-current="date" for screen reader today identification */}
              <div
                aria-current={isToday ? "date" : undefined}
                className={`sticky top-0 px-3 py-2 border-b border-gray-100 flex items-center justify-between ${
                  isToday ? "bg-blue-50" : "bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {format(day, "EEE")}
                  </span>
                  <span
                    className={`text-lg font-semibold ${isToday ? "text-blue-600" : "text-gray-900"}`}
                  >
                    {format(day, "d")}
                  </span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {dayJobs.length} job{dayJobs.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="p-2 flex flex-col gap-2">
                {dayJobs.map((job) => (
                  // FIX (polish): neutral card bg — status color belongs on the badge, not the card
                  <Link
                    key={job.id}
                    href="/jobs"
                    className="block p-3 rounded border border-gray-200 bg-white hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold tabular-nums uppercase text-gray-500">
                        {formatTime(job.scheduledStart)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${getStatusColor(job.status)}`}
                      >
                        {job.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-sm font-bold leading-tight mb-0.5 text-gray-900">
                      {job.clientName}
                    </div>
                    <div className="text-xs font-medium text-gray-600">
                      {job.title}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
