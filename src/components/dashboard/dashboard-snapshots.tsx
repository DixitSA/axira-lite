"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, Bell, ChevronRight, Info } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, formatTime, formatRelativeDate } from "@/lib/utils/format";
import SMSComposer from "@/components/sms-composer";
import ComposeModal from "@/components/reminders/compose-modal";

interface DashboardSnapshotsProps {
  todayJobs: any[];
  tomorrowJobs: any[];
  overdueInvoices: any[];
  businessName: string;
}

export default function DashboardSnapshots({
  todayJobs,
  tomorrowJobs,
  overdueInvoices,
  businessName,
}: DashboardSnapshotsProps) {
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  const openSms = (e: React.MouseEvent, client: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClient(client);
    setIsSmsOpen(true);
  };

  const openReminder = (e: React.MouseEvent, client: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedClient(client);
    setIsReminderOpen(true);
  };

  const allJobs = [...todayJobs, ...tomorrowJobs];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Jobs Snapshot */}
        <section aria-labelledby="upcoming-schedule-title" className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 id="upcoming-schedule-title" className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Today's Schedule</h2>
              <div className="group relative">
                <Info size={12} className="text-gray-300 cursor-help" />
                <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-[10px] text-white rounded shadow-xl z-50">
                  Confirmed jobs for today and tomorrow. Use the icons to send quick messages.
                </div>
              </div>
            </div>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{allJobs.length} Active</span>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {allJobs.length > 0 ? (
              allJobs.map((job) => (
                <Link 
                  key={job.id} 
                  href={`/jobs/${job.id}`}
                  className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors group border-b last:border-0 border-gray-100 relative"
                >
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                      {job.client.firstName} {job.client.lastName}
                    </span>
                    <div className="flex items-center gap-3">
                       <span className="text-xs font-bold text-blue-600 tabular-nums uppercase">{formatTime(job.scheduledStart)}</span>
                       <span className="h-1 w-1 rounded-full bg-gray-300" />
                       <span className="text-xs font-medium text-gray-500">{job.title}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={(e) => openSms(e, job.client)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="Quick Message"
                      >
                        <MessageSquare size={14} strokeWidth={2.5} />
                      </button>
                      <button 
                        onClick={(e) => openReminder(e, job.client)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                        title="Send Reminder"
                      >
                        <Bell size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No appointments scheduled</p>
              </div>
            )}
          </div>
        </section>

        {/* Invoices Snapshot */}
        <section aria-labelledby="flagged-accounts-title" className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 id="flagged-accounts-title" className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Flagged Accounts</h2>
              <div className="group relative">
                <Info size={12} className="text-gray-300 cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block w-48 p-2 bg-gray-900 text-[10px] text-white rounded shadow-xl z-50">
                  Overdue invoices requiring immediate follow-up.
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
              <span className="text-[10px] font-bold text-red-600 uppercase">{overdueInvoices.length} Overdue</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100 flex-1">
            {overdueInvoices.length > 0 ? (
              overdueInvoices.map((inv) => (
                <Link 
                  key={inv.id} 
                  href={`/invoices/${inv.id}`}
                  className="p-3 px-5 flex items-center justify-between hover:bg-red-50/30 transition-colors group border-b last:border-0 border-gray-100"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900">
                      {inv.client.firstName} {inv.client.lastName}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                        {formatRelativeDate(inv.dueDate)}
                      </span>
                      <button 
                        onClick={(e) => openSms(e, inv.client)}
                        className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-blue-600 rounded-md transition-all"
                      >
                        <MessageSquare size={12} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600 tabular-nums tracking-tighter">
                      {formatCurrency(inv.amount - inv.paidAmount)}
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Accounts current</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <SMSComposer 
        isOpen={isSmsOpen}
        onClose={() => setIsSmsOpen(false)}
        client={selectedClient}
        businessName={businessName}
      />

      <ComposeModal 
        isOpen={isReminderOpen}
        onClose={() => setIsReminderOpen(false)}
        clientId={selectedClient?.id}
        clientName={selectedClient ? `${selectedClient.firstName} ${selectedClient.lastName}` : ""}
      />
    </>
  );
}
