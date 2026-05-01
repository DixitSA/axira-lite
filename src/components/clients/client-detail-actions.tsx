"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import SMSComposer from "@/components/sms-composer";

interface ClientDetailActionsProps {
  client: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  businessName: string;
}

export default function ClientDetailActions({ client, businessName }: ClientDetailActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all"
      >
        <MessageSquare size={16} strokeWidth={2.5} />
        Send Message
      </button>

      <SMSComposer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        client={client}
        businessName={businessName}
      />
    </>
  );
}
