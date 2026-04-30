"use client";

import { useTransition } from "react";
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
  ArrowDown
} from "lucide-react";
import { 
  markJobInProgress, 
  markJobComplete, 
  createInvoiceForJob, 
  cancelJob 
} from "@/lib/actions/jobs";

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

  const handleAction = (actionFn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await actionFn();
      } catch (error) {
        console.error("Action failed:", error);
        alert(error instanceof Error ? error.message : "Action failed");
      }
    });
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
            <div className="flex items-center" onClick={() => handleSort("client")}>
              Client <SortIcon field="client" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[25%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center" onClick={() => handleSort("title")}>
              Title <SortIcon field="title" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center" onClick={() => handleSort("scheduledStart")}>
              Scheduled Date <SortIcon field="scheduledStart" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%]">Status</DataTableCell>
          <DataTableCell isHeader className="w-[10%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-end" onClick={() => handleSort("amount")}>
              Amount <SortIcon field="amount" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[10%]">Invoice</DataTableCell>
          <DataTableCell isHeader className="w-[5%] text-right">Actions</DataTableCell>
        </DataTableHeader>
        <DataTableBody>
          {jobs.map((job) => {
            const amount = job.finalAmount || job.quotedAmount;
            const invoiceStatus = job.invoicedAt ? "Invoiced" : (job.status === "COMPLETED" ? "Not Invoiced" : "N/A");
            
            return (
              <DataTableRow key={job.id}>
                <DataTableCell className="font-medium text-gray-900">
                  {job.client.firstName} {job.client.lastName}
                </DataTableCell>
                <DataTableCell>{job.title}</DataTableCell>
                <DataTableCell>{formatDate(job.scheduledStart)}</DataTableCell>
                <DataTableCell>
                  <StatusBadge status={job.status} />
                </DataTableCell>
                <DataTableCell className="text-right font-medium">
                  {amount != null ? formatCurrency(amount) : "—"}
                </DataTableCell>
                <DataTableCell>
                  <span className={`text-xs font-medium ${
                    invoiceStatus === "Invoiced" ? "text-green-600" :
                    invoiceStatus === "Not Invoiced" ? "text-amber-600" : "text-gray-400"
                  }`}>
                    {invoiceStatus}
                  </span>
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="relative group inline-block text-left">
                    <button className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none">
                      <MoreHorizontal size={18} />
                    </button>
                    <div className="hidden group-hover:block absolute right-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1" role="menu">
                        {job.status === "SCHEDULED" && (
                          <button
                            onClick={() => handleAction(() => markJobInProgress(job.id))}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <Play size={14} className="text-amber-500" /> Mark In Progress
                          </button>
                        )}
                        {(job.status === "SCHEDULED" || job.status === "IN_PROGRESS") && (
                          <button
                            onClick={() => handleAction(() => markJobComplete(job.id))}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <CheckCircle size={14} className="text-green-500" /> Mark Complete
                          </button>
                        )}
                        {job.status === "COMPLETED" && !job.invoicedAt && (
                          <button
                            onClick={() => handleAction(() => createInvoiceForJob(job.id))}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                          >
                            <FileText size={14} className="text-blue-500" /> Create Invoice
                          </button>
                        )}
                        {job.status !== "COMPLETED" && job.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleAction(() => cancelJob(job.id))}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                          >
                            <XCircle size={14} /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </DataTableCell>
              </DataTableRow>
            );
          })}
        </DataTableBody>
      </DataTable>
    </div>
  );
}
