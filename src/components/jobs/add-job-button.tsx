"use client";

import { useState } from "react";
import JobForm from "@/components/jobs/job-form";

interface AddJobButtonProps {
  clients: { id: number; firstName: string; lastName: string }[];
}

export default function AddJobButton({ clients }: AddJobButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
      >
        Add Job
      </button>
      <JobForm isOpen={isOpen} onClose={() => setIsOpen(false)} clients={clients} />
    </>
  );
}
