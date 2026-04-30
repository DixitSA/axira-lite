"use client";

import { useState } from "react";
import InvoiceForm from "@/components/invoices/invoice-form";

interface AddInvoiceButtonProps {
  clients: { id: number; firstName: string; lastName: string }[];
}

export default function AddInvoiceButton({ clients }: AddInvoiceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Create Invoice
      </button>
      <InvoiceForm isOpen={isOpen} onClose={() => setIsOpen(false)} clients={clients} />
    </>
  );
}
