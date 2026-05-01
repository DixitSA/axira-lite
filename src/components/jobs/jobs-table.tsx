"use client";

import { useState, useTransition } from "react";
import { showToast } from "@/components/ui/toast";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import StatusBadge from "@/components/ui/status-badge";
import EmptyState from "@/components/ui/empty-state";
import { 
  DataTable, 
  DataTableHeader, 
  DataTableBody, 
  DataTableRow, 
  DataTableCell 
} from "@/components/ui/data-table";
import { 
  MoreHorizontal, 
  Play, 
  CheckCircle, 
  FileText, 
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Bell
} from "lucide-react";
import { 
  markJobInProgress, 
  markJobComplete, 
  createInvoiceForJob, 
  cancelJob 
} from "@/lib/actions/jobs";
import ComposeModal from "@/components/reminders/compose-modal";

// Defined locally to avoid needing complex type exports from Prisma right now
type JobWithClient = any; 

interface JobsTableProps {
  jobs: JobWithClient[];
}

export default function JobsTable({ jobs }: JobsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Reminder Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedContext, setSelectedContext] = useState<any>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const sortField = searchParams.get("sort") || "scheduledStart";
  const sortDir = searchParams.get("dir") || "desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortField === field) {
      params.set("dir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("dir", "desc");
    }
    router.push(pathname + "?" + params.toString());
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    return sortDir === "asc" 
      ? <ArrowUp size={14} className="ml-1 text-blue-600" /> 
      : <ArrowDown size={14} className="ml-1 text-blue-600" />;
  };

  const handleAction = (actionFn: () => Promise<void>, successMsg?: string) => {
    startTransition(async () => {
      try {
        await actionFn();
        if (successMsg) showToast(successMsg);
      } catch (error) {
        console.error("Action failed:", error);
        showToast(error instanceof Error ? error.message : "Action failed", "error");
      }
    });
  };

  const openReminder = (job: any) => {
    setSelectedContext({ 
      clientId: job.clientId, 
      clientName: `${job.client.firstName} ${job.client.lastName}`,
      jobId: job.id,
      amount: job.finalAmount || job.quotedAmount,
      serviceType: job.title,
      appointmentDate: job.scheduledStart
    });
    setIsModalOpen(true);
  };

  if (!jobs?.length) {
    return (
      <div className="p-6">
        <EmptyState 
          title="No jobs found" 
          description="Try adjusting your filters or search terms." 
        />
      </div>
    );
  }

  return (
    <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
      <DataTable>
        <DataTableHeader>
          <DataTableCell isHeader className="w-[20%] cursor-pointer hover:bg-gray-100 transition-colors" >
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("client")}>
              Client <SortIcon field="client" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[25%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("title")}>
              Title <SortIcon field="title" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("scheduledStart")}>
              Scheduled <SortIcon field="scheduledStart" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Status</DataTableCell>
          <DataTableCell isHeader className="w-[10%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("amount")}>
              Amount <SortIcon field="amount" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[10%] text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Invoice</DataTableCell>
          <DataTableCell isHeader className="w-[5%] text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</DataTableCell>
        </DataTableHeader>
        <DataTableBody>
          {jobs.map((job) => {
            const amount = job.finalAmount || job.quotedAmount;
            const invoiceStatus = job.invoicedAt ? "Invoiced" : (job.status === "COMPLETED" ? "Not Invoiced" : "N/A");
            
            return (
              <DataTableRow key={job.id} className="hover:bg-blue-50/30 transition-colors group">
                <DataTableCell className="py-2.5 font-bold text-gray-900 tracking-tight">
                  {job.client.firstName} {job.client.lastName}
                </DataTableCell>
                <DataTableCell className="py-2.5 text-xs font-medium text-gray-600">{job.title}</DataTableCell>
                <DataTableCell className="py-2.5 text-xs font-bold text-gray-500 tabular-nums">{formatDate(job.scheduledStart)}</DataTableCell>
                <DataTableCell className="py-2.5">
                  <StatusBadge status={job.status} />
                </DataTableCell>
                <DataTableCell className="py-2.5 text-right font-bold text-gray-900 tabular-nums">
                  {amount != null ? formatCurrency(amount) : "—"}
                </DataTableCell>
                <DataTableCell className="py-2.5">
                  <span className={`text-[10px] font-bold uppercase tracking-tight ${
                    invoiceStatus === "Invoiced" ? "text-green-600" :
                    invoiceStatus === "Not Invoiced" ? "text-amber-600" : "text-gray-400"
                  }`}>
                    {invoiceStatus}
                  </span>
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="relative inline-block text-left">
                    <button 
                      onClick={() => setOpenDropdownId(openDropdownId === job.id ? null : job.id)}
                      aria-label="Job actions"
                      className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {openDropdownId === job.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <div className="absolute right-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-20">
                          <div className="py-1" role="menu">
                            {job.status === "SCHEDULED" && (
                              <button
                                onClick={() => {
                                  handleAction(() => markJobInProgress(job.id), "Job marked in progress");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Play size={14} className="text-amber-500" /> Mark In Progress
                              </button>
                            )}
                            {(job.status === "SCHEDULED" || job.status === "IN_PROGRESS") && (
                              <button
                                onClick={() => {
                                  handleAction(() => markJobComplete(job.id), "Job marked complete");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <CheckCircle size={14} className="text-green-500" /> Mark Complete
                              </button>
                            )}
                            <button
                              onClick={() => {
                                openReminder(job);
                                setOpenDropdownId(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Bell size={14} className="text-blue-500" /> Send Reminder
                            </button>
                            {job.status === "COMPLETED" && !job.invoicedAt && (
                              <button
                                onClick={() => {
                                  handleAction(() => createInvoiceForJob(job.id), "Invoice created");
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                              >
                                <FileText size={14} className="text-blue-500" /> Create Invoice
                              </button>
                            )}
                            {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to cancel the job for ${job.client.firstName}? This action cannot be undone.`)) {
                                    handleAction(() => cancelJob(job.id), "Job cancelled");
                                  }
                                  setOpenDropdownId(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              >
                                <XCircle size={14} /> Cancel
                              </button>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>

      <ComposeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clientId={selectedContext?.clientId}
        clientName={selectedContext?.clientName}
        jobId={selectedContext?.jobId}
        amount={selectedContext?.amount}
        serviceType={selectedContext?.serviceType}
        appointmentDate={selectedContext?.appointmentDate}
      />
    </div>
  );
}
