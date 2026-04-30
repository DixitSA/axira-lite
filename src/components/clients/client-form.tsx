"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/actions/clients";
import { showToast } from "@/components/ui/toast";

interface ClientFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ClientForm({ isOpen, onClose }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = await createClient(formData);
      if (result.success) {
        showToast("Client created successfully");
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
          <h3 className="font-semibold text-gray-900 text-lg">New Client</h3>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <form action={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="cf-firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input id="cf-firstName" name="firstName" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label htmlFor="cf-lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input id="cf-lastName" name="lastName" type="text" required className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
            </div>
          </div>

          <div>
            <label htmlFor="cf-phone" className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input id="cf-phone" name="phone" type="tel" required className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div>
            <label htmlFor="cf-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input id="cf-email" name="email" type="email" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div>
            <label htmlFor="cf-companyName" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <input id="cf-companyName" name="companyName" type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div>
            <label htmlFor="cf-address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input id="cf-address" name="address" type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary" />
          </div>

          <div>
            <label htmlFor="cf-notes" className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea id="cf-notes" name="notes" rows={3} className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary resize-none" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={isPending} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors">
              {isPending ? "Creating..." : "Create Client"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
