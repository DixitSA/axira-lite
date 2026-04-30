"use client";

import { useState } from "react";
import ClientForm from "@/components/clients/client-form";

export default function AddClientButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Add Client
      </button>
      <ClientForm isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
