"use client";

import { useState } from "react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { formatTime } from "@/lib/utils/format";

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

export default function WeeklyCalendar({ jobs }: WeeklyCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start on Monday
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  const nextWeek = () => setCurrentDate(addDays(currentDate, 7));
  const prevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const today = () => setCurrentDate(new Date());

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED": return "bg-green-100 text-green-800 border-green-200";
      case "IN_PROGRESS": return "bg-amber-100 text-amber-800 border-amber-200";
      case "CANCELLED": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col h-[calc(100vh-12rem)] min-h-[600px]">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            {format(startDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center rounded-md bg-white border border-gray-200 overflow-hidden shadow-sm">
            <button onClick={prevWeek} className="p-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button onClick={today} className="px-3 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 border-x border-gray-200 transition-colors">
              Today
            </button>
            <button onClick={nextWeek} className="p-1.5 hover:bg-gray-50 text-gray-600 transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-400" /><span className="text-[10px] font-bold text-gray-400 uppercase">Scheduled</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-amber-400" /><span className="text-[10px] font-bold text-gray-400 uppercase">In Progress</span></div>
          <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-400" /><span className="text-[10px] font-bold text-gray-400 uppercase">Completed</span></div>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-7 overflow-hidden">
        {/* Day Headers */}
        {days.map((day, i) => (
          <div key={`header-${i}`} className="border-b border-r border-gray-100 p-3 text-center bg-white">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(day, "EEE")}</div>
            <div className={`text-lg font-semibold mt-0.5 ${isSameDay(day, new Date()) ? "text-blue-600" : "text-gray-900"}`}>
              {format(day, "d")}
            </div>
          </div>
        ))}

        {/* Day Columns */}
        {days.map((day, i) => {
          const dayJobs = jobs.filter(j => isSameDay(new Date(j.scheduledStart), day)).sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());
          
          return (
            <div key={`col-${i}`} className="border-r border-gray-100 p-2 overflow-y-auto bg-gray-50/30">
              <div className="flex flex-col gap-2">
                {dayJobs.map(job => (
                  <Link 
                    key={job.id} 
                    href={`/jobs/${job.id}`}
                    className={`block p-2 rounded border ${getStatusColor(job.status)} hover:opacity-80 transition-opacity shadow-sm`}
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
    </div>
  );
}
