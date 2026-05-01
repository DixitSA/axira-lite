"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { formatCurrency, formatRelativeDate } from "@/lib/utils/format";
import { computeClientHealth } from "@/lib/utils/client-health";
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
  Bell,
  PlusCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import ComposeModal from "@/components/reminders/compose-modal";
import JobForm from "@/components/jobs/job-form";

type ClientType = any; // Avoiding deep Prisma type export for now

interface ClientsTableProps {
  clients: ClientType[];
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reminder Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: number, name: string } | null>(null);

  // Job Modal State
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [selectedClientIdForJob, setSelectedClientIdForJob] = useState<number | undefined>(undefined);

  const sortField = searchParams.get("sort") || "lastJobAt";
  const sortDir = searchParams.get("dir") || "desc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortField === field) {
      params.set("dir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("dir", field === "firstName" ? "asc" : "desc");
    }
    router.push(pathname + "?" + params.toString());
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    return sortDir === "asc" 
      ? <ArrowUp size={14} className="ml-1 text-blue-600" /> 
      : <ArrowDown size={14} className="ml-1 text-blue-600" />;
  };

  const openReminder = (clientId: number, clientName: string) => {
    setSelectedClient({ id: clientId, name: clientName });
    setIsModalOpen(true);
  };

  const openJobModal = (clientId: number) => {
    setSelectedClientIdForJob(clientId);
    setIsJobModalOpen(true);
  };

  if (!clients?.length) {
    return (
      <div className="p-6">
        <EmptyState 
          title="No clients found" 
          description="Try adjusting your search terms." 
        />
      </div>
    );
  }

  return (
    <>
      <DataTable>
        <DataTableHeader>
          <DataTableCell isHeader className="w-[25%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("firstName")}>
              Client <SortIcon field="firstName" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Phone</DataTableCell>
          <DataTableCell isHeader className="w-[15%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("totalRevenue")}>
              Revenue <SortIcon field="totalRevenue" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-end text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("outstandingBalance")}>
              Balance <SortIcon field="outstandingBalance" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]" onClick={() => handleSort("lastJobAt")}>
              Last Activity <SortIcon field="lastJobAt" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[10%] text-center text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Health</DataTableCell>
          <DataTableCell isHeader className="w-[5%] text-right text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Actions</DataTableCell>
        </DataTableHeader>
        <DataTableBody>
          {clients.map((client) => {
            const clientName = `${client.firstName} ${client.lastName}`;
            const hasBalance = client.outstandingBalance > 0;
            const healthStatus = computeClientHealth(client.lastJobAt);
            const needsAttention = healthStatus === "AT_RISK" || healthStatus === "INACTIVE";

            return (
              <DataTableRow 
                key={client.id}
                className={`hover:bg-blue-50/30 transition-colors group ${hasBalance ? "bg-red-50/20" : ""}`}
              >
                <DataTableCell className="py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-gray-900 tracking-tight">{clientName}</span>
                    {client.companyName && <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{client.companyName}</span>}
                  </div>
                </DataTableCell>
                <DataTableCell className="py-2.5 text-xs font-bold text-gray-500 tabular-nums">
                  {client.phone}
                </DataTableCell>
                <DataTableCell className="py-2.5 text-right font-bold text-gray-900 tabular-nums">
                  {formatCurrency(client.totalRevenue)}
                </DataTableCell>
                <DataTableCell className={`py-2.5 text-right font-bold tabular-nums ${hasBalance ? "text-red-600" : "text-gray-400"}`}>
                  {formatCurrency(client.outstandingBalance)}
                </DataTableCell>
                <DataTableCell className="py-2.5 text-xs font-bold text-gray-500 tabular-nums uppercase">
                  {client.lastJobAt ? formatRelativeDate(client.lastJobAt) : "None"}
                </DataTableCell>
                <DataTableCell className="py-2.5 text-center">
                  <div 
                    title="Health reflects recent job activity."
                    className={needsAttention ? "ring-2 ring-offset-1 ring-red-100 rounded-full inline-block" : ""}
                  >
                    <StatusBadge status={healthStatus} />
                  </div>
                </DataTableCell>
                <DataTableCell className="py-2.5 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => openJobModal(client.id)}
                      title="New Job"
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-all"
                    >
                      <PlusCircle size={16} strokeWidth={2.5} />
                    </button>
                    <button
                      onClick={() => openReminder(client.id, clientName)}
                      title="Send Reminder"
                      className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-all"
                    >
                      <Bell size={16} strokeWidth={2.5} />
                    </button>
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
        clientId={selectedClient?.id}
        clientName={selectedClient?.name}
      />

      <JobForm 
        isOpen={isJobModalOpen} 
        onClose={() => setIsJobModalOpen(false)} 
        clients={clients} 
        defaultClientId={selectedClientIdForJob} 
      />
    </>
  );
}
