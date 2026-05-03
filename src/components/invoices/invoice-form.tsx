"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { createInvoice } from "@/lib/actions/invoices";

interface InvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  clients: { id: number; firstName: string; lastName: string }[];
}

export default function InvoiceForm({ isOpen, onClose, clients }: InvoiceFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createInvoice(formData);
      if (result.success) {
        showToast("Invoice created successfully");
        onClose();
      } else {
        setError(result.error || "Something went wrong");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-semibold text-gray-900 text-lg">Create Invoice</h3>
          <button onClick={onClose} aria-label="Close" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="if-clientId" className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <select id="if-clientId" name="clientId" required className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary">
              <option value="">Select a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="if-amount" className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
            <input id="if-amount" name="amount" type="number" step="0.01" min="0.01" required className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div>
            <label htmlFor="if-dueDate" className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
            <input id="if-dueDate" name="dueDate" type="date" required className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div>
            <label htmlFor="if-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="if-notes" name="notes" rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {isPending ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
