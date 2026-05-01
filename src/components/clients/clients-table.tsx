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
            <div className="flex items-center" onClick={() => handleSort("firstName")}>
              Name <SortIcon field="firstName" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%]">Phone</DataTableCell>
          <DataTableCell isHeader className="w-[15%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-end" onClick={() => handleSort("totalRevenue")}>
              Total Revenue <SortIcon field="totalRevenue" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center justify-end" onClick={() => handleSort("outstandingBalance")}>
              Outstanding <SortIcon field="outstandingBalance" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[15%] cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center" onClick={() => handleSort("lastJobAt")}>
              Last Job <SortIcon field="lastJobAt" />
            </div>
          </DataTableCell>
          <DataTableCell isHeader className="w-[10%] text-center">Health</DataTableCell>
          <DataTableCell isHeader className="w-[5%] text-right">Actions</DataTableCell>
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
                className={hasBalance ? "bg-red-50/20" : ""}
              >
                <DataTableCell className="font-medium text-gray-900">
                  <div className="flex flex-col">
                    <span>{clientName}</span>
                    {client.companyName && <span className="text-xs text-gray-500 font-normal">{client.companyName}</span>}
                  </div>
                </DataTableCell>
                <DataTableCell className="text-gray-500">
                  {client.phone}
                </DataTableCell>
                <DataTableCell className="text-right font-medium">
                  {formatCurrency(client.totalRevenue)}
                </DataTableCell>
                <DataTableCell className={`text-right font-medium ${hasBalance ? "text-red-600" : "text-gray-500 font-normal"}`}>
                  {formatCurrency(client.outstandingBalance)}
                </DataTableCell>
                <DataTableCell className="text-gray-500">
                  {client.lastJobAt ? formatRelativeDate(client.lastJobAt) : "Never"}
                </DataTableCell>
                <DataTableCell className="text-center">
                  <div 
                    title="Health reflects recent job activity. WATCH: >60 days since last job. AT RISK: >90 days. INACTIVE: >180 days."
                    className={needsAttention ? "ring-2 ring-offset-1 ring-red-100 rounded-full inline-block" : ""}
                  >
                    <StatusBadge status={healthStatus} />
                  </div>
                </DataTableCell>
                <DataTableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => alert("Navigate to New Job form (Phase 6)")}
                      title="New Job"
                      className="p-2 rounded-md text-gray-400 hover:text-green-600 hover:bg-green-50 focus:outline-none transition-all"
                    >
                      <PlusCircle size={18} />
                    </button>
                    <button
                      onClick={() => openReminder(client.id, clientName)}
                      title="Send Reminder"
                      className="p-2 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50 focus:outline-none transition-all"
                    >
                      <Bell size={18} />
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
    </>
  );
}
