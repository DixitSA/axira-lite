"use client";

import { useTransition } from "react";
import { showToast } from "@/components/ui/toast";
import { markJobInProgress, markJobComplete, cancelJob, createInvoiceForJob } from "@/lib/actions/jobs";
import { Play, CheckCircle, XCircle, FileText } from "lucide-react";

interface JobDetailActionsProps {
  jobId: number;
  status: string;
  hasInvoice: boolean;
}

export default function JobDetailActions({ jobId, status, hasInvoice }: JobDetailActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (actionFn: () => Promise<void>, successMsg: string) => {
    startTransition(async () => {
      try {
        await actionFn();
        showToast(successMsg);
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Action failed", "error");
      }
    });
  };

  return (
    <div className={`flex items-center gap-2 ${isPending ? "opacity-50 pointer-events-none" : ""}`}>
      {status === "SCHEDULED" && (
        <button
          onClick={() => handleAction(() => markJobInProgress(jobId), "Job marked as in progress")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Play size={14} /> Start Job
        </button>
      )}
      {(status === "SCHEDULED" || status === "IN_PROGRESS") && (
        <button
          onClick={() => handleAction(() => markJobComplete(jobId), "Job completed")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
        >
          <CheckCircle size={14} /> Complete
        </button>
      )}
      {status === "COMPLETED" && !hasInvoice && (
        <button
          onClick={() => handleAction(() => createInvoiceForJob(jobId).then(() => {}), "Invoice created")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
        >
          <FileText size={14} /> Create Invoice
        </button>
      )}
      {status !== "COMPLETED" && status !== "CANCELLED" && (
        <button
          onClick={() => handleAction(() => cancelJob(jobId), "Job cancelled")}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-gray-300 rounded-lg hover:bg-red-50 transition-colors"
        >
          <XCircle size={14} /> Cancel
        </button>
      )}
    </div>
  );
}
