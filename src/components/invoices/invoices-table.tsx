"use client";

import { useState, useTransition } from "react";
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
  CheckCircle, 
  Bell, 
  XCircle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { markInvoicePaid, voidInvoice } from "@/lib/actions/invoices";
import ComposeModal from "@/components/reminders/compose-modal";

type InvoiceWithRelations = any;

interface InvoicesTableProps {
  invoices: InvoiceWithRelations[];
}

export default function InvoicesTable({ invoices }: InvoicesTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Reminder Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<{ id: number, name: string, invoiceId: number } | null>(null);

  const sortField = searchParams.get("sort") || "dueDate";
  const sortDir = searchParams.get("dir") || "asc";

  const handleSort = (field: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (sortField === field) {
      params.set("dir", sortDir === "asc" ? "desc" : "asc");
    } else {
      params.set("sort", field);
      params.set("dir", "asc"); // Default to asc for dates
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

  const openReminder = (clientId: number, clientName: string, invoiceId: number) => {
    setSelectedClient({ id: clientId, name: clientName, invoiceId });
    setIsModalOpen(true);
  };

  if (!invoices?.length) {
    return (
      <div className="p-6">
        <EmptyState 
          title="No invoices found" 
          description="Try adjusting your filters or search terms." 
        />
      </div>
    );
  }

  const now = new Date();

  return (
    <>
      <div className={isPending ? "opacity-60 pointer-events-none transition-opacity" : ""}>
        <DataTable>
          <DataTableHeader>
            <DataTableCell isHeader className="w-[15%] cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center" onClick={() => handleSort("invoiceNumber")}>
                Invoice # <SortIcon field="invoiceNumber" />
              </div>
            </DataTableCell>
            <DataTableCell isHeader className="w-[20%] cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center" onClick={() => handleSort("client")}>
                Client <SortIcon field="client" />
              </div>
            </DataTableCell>
            <DataTableCell isHeader className="w-[15%]">Linked Job</DataTableCell>
            <DataTableCell isHeader className="w-[10%] text-right cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-end" onClick={() => handleSort("amount")}>
                Amount <SortIcon field="amount" />
              </div>
            </DataTableCell>
            <DataTableCell isHeader className="w-[10%]">Issue Date</DataTableCell>
            <DataTableCell isHeader className="w-[10%] cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center" onClick={() => handleSort("dueDate")}>
                Due Date <SortIcon field="dueDate" />
              </div>
            </DataTableCell>
            <DataTableCell isHeader className="w-[10%] text-center">Status</DataTableCell>
            <DataTableCell isHeader className="w-[5%] text-right">Actions</DataTableCell>
          </DataTableHeader>
          <DataTableBody>
            {invoices.map((invoice) => {
              const isOverdue = invoice.status === "OVERDUE";
              
              let daysOverdue = 0;
              if (isOverdue) {
                const diffMs = now.getTime() - new Date(invoice.dueDate).getTime();
                daysOverdue = Math.floor(diffMs / (1000 * 60 * 60 * 24));
              }
              
              const clientName = `${invoice.client.firstName} ${invoice.client.lastName}`;

              return (
                <DataTableRow 
                  key={invoice.id} 
                  className={isOverdue ? "bg-red-50/50 hover:bg-red-100/50" : ""}
                >
                  <DataTableCell className="font-medium text-gray-900">
                    {invoice.invoiceNumber}
                  </DataTableCell>
                  <DataTableCell className="font-medium text-gray-900">
                    {clientName}
                  </DataTableCell>
                  <DataTableCell className="text-gray-500">
                    {invoice.job ? invoice.job.title : "—"}
                  </DataTableCell>
                  <DataTableCell className="text-right font-medium">
                    {formatCurrency(invoice.amount)}
                  </DataTableCell>
                  <DataTableCell>{formatDate(invoice.issueDate)}</DataTableCell>
                  <DataTableCell>
                    <div className="flex flex-col">
                      <span>{formatDate(invoice.dueDate)}</span>
                      {isOverdue && daysOverdue > 0 && (
                        <span className="text-xs font-semibold text-red-600">
                          {daysOverdue} days overdue
                        </span>
                      )}
                    </div>
                  </DataTableCell>
                  <DataTableCell className="text-center">
                    <StatusBadge status={invoice.status} />
                  </DataTableCell>
                  <DataTableCell className="text-right">
                    <div className="relative group inline-block text-left">
                      <button 
                        aria-label="Invoice actions"
                        aria-haspopup="true"
                        className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      <div className="hidden group-hover:block absolute right-0 mt-0 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu">
                          {(invoice.status === "PENDING" || invoice.status === "OVERDUE") && (
                            <button
                              onClick={() => handleAction(() => markInvoicePaid(invoice.id))}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <CheckCircle size={14} className="text-green-500" /> Mark Paid
                            </button>
                          )}
                          {(invoice.status === "PENDING" || invoice.status === "OVERDUE") && (
                            <button
                              onClick={() => openReminder(invoice.clientId, clientName, invoice.id)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                            >
                              <Bell size={14} className="text-blue-500" /> Send Reminder
                            </button>
                          )}
                          {invoice.status !== "VOID" && invoice.status !== "PAID" && (
                            <button
                              onClick={() => handleAction(() => voidInvoice(invoice.id))}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <XCircle size={14} /> Void
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

      <ComposeModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        clientId={selectedClient?.id}
        clientName={selectedClient?.name}
        invoiceId={selectedClient?.invoiceId}
      />
    </>
  );
}
