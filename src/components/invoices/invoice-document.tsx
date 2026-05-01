"use client";

import { formatCurrency, formatDate } from "@/lib/utils/format";
import { Printer, Download, CreditCard, XCircle } from "lucide-react";
import StatusBadge from "@/components/ui/status-badge";
import { markInvoicePaid, voidInvoice } from "@/lib/actions/invoices";
import { showToast } from "@/components/ui/toast";
import { useTransition } from "react";

interface InvoiceDocumentProps {
  invoice: any;
  business: any;
  client: any;
}

export default function InvoiceDocument({ invoice, business, client }: InvoiceDocumentProps) {
  const [isPending, startTransition] = useTransition();

  const handlePrint = () => {
    window.print();
  };

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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-4">
          <StatusBadge status={invoice.status} />
          <span className="text-sm font-medium text-gray-500">
            Created on {formatDate(invoice.issueDate)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {invoice.status === "PENDING" && (
            <button 
              onClick={() => handleAction(() => markInvoicePaid(invoice.id), "Invoice marked as paid")}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              <CreditCard size={14} /> Record Payment
            </button>
          )}
          {(invoice.status === "PENDING" || invoice.status === "OVERDUE") && (
            <button 
              onClick={() => handleAction(() => voidInvoice(invoice.id), "Invoice voided")}
              disabled={isPending}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <XCircle size={14} /> Void
            </button>
          )}
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors ml-4"
          >
            <Printer size={14} /> Print / PDF
          </button>
        </div>
      </div>

      {/* Actual Invoice Document */}
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-8 md:p-12 print:border-none print:shadow-none print:p-0">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{business.name}</h1>
            <p className="text-sm text-gray-500">{business.phone}</p>
            <p className="text-sm text-gray-500">{business.email}</p>
          </div>
          <div className="text-right">
            <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2">Invoice</h2>
            <p className="text-sm font-bold text-gray-900">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-12 mb-12">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Billed To</p>
            <h3 className="text-base font-bold text-gray-900 tracking-tight">
              {client.firstName} {client.lastName}
            </h3>
            {client.companyName && <p className="text-sm text-gray-600">{client.companyName}</p>}
            {client.address && <p className="text-sm text-gray-600 whitespace-pre-line">{client.address}</p>}
            <p className="text-sm text-gray-600 mt-1">{client.phone}</p>
          </div>
          <div className="text-right">
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Issue Date</p>
              <p className="text-sm font-medium text-gray-900">{formatDate(invoice.issueDate)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Due Date</p>
              <p className={`text-sm font-bold ${invoice.status === "OVERDUE" ? "text-red-600" : "text-gray-900"}`}>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12 border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Description</th>
                <th className="px-4 py-3 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr>
                <td className="px-4 py-4">
                  <p className="text-sm font-bold text-gray-900">
                    {invoice.job ? invoice.job.title : "Service rendered"}
                  </p>
                  {invoice.job && invoice.job.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{invoice.job.description}</p>
                  )}
                </td>
                <td className="px-4 py-4 text-right text-sm font-bold text-gray-900 tabular-nums">
                  {formatCurrency(invoice.amount)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex justify-end mb-12">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-bold tabular-nums">{formatCurrency(invoice.amount)}</span>
            </div>
            {invoice.paidAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Amount Paid</span>
                <span className="font-bold tabular-nums">-{formatCurrency(invoice.paidAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-black border-t border-gray-200 pt-3">
              <span>Balance Due</span>
              <span className="tabular-nums tracking-tighter">
                {formatCurrency(invoice.amount - invoice.paidAmount)}
              </span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="pt-8 border-t border-gray-200">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">Notes / Terms</p>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
