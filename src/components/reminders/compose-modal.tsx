"use client";

import { useState, useTransition, useEffect } from "react";
import { X, Send, AlignLeft } from "lucide-react";
import { showToast } from "@/components/ui/toast";
import { sendReminder } from "@/lib/actions/reminders";
import { REMINDER_TEMPLATES, interpolateTemplate } from "@/lib/utils/reminder-templates";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  clientName?: string;
  invoiceId?: number;
  jobId?: number;
  businessName?: string;
  // Context for interpolation
  amount?: number;
  dueDate?: Date;
  serviceType?: string;
  appointmentDate?: Date;
}

export default function ComposeModal({ 
  isOpen, 
  onClose, 
  clientId, 
  clientName,
  invoiceId,
  jobId,
  amount,
  dueDate,
  serviceType,
  appointmentDate
}: ComposeModalProps) {
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  // Reset message when modal opens with new context
  useEffect(() => {
    if (isOpen) setMessage("");
  }, [isOpen, clientId]);

  if (!isOpen) return null;

  const applyTemplate = (templateType: keyof typeof REMINDER_TEMPLATES) => {
    const firstName = clientName ? clientName.split(" ")[0] : "Customer";
    const interpolated = interpolateTemplate(REMINDER_TEMPLATES[templateType], {
      firstName,
      businessName: "Axira Lite", // Hardcoded business context
      amount,
      dueDate,
      serviceType: serviceType || "service",
      appointmentDate,
    });
    setMessage(interpolated);
  };

  const handleSend = () => {
    if (!clientId) return;
    
    startTransition(async () => {
      try {
        const result = await sendReminder({
          clientId,
          invoiceId,
          jobId,
          content: message,
        });
        onClose();
        if (result.simulated) {
          showToast("Message saved (SMS simulated, configure Twilio for live delivery)");
        } else {
          showToast("SMS sent successfully!");
        }
      } catch (error) {
        showToast(error instanceof Error ? error.message : "Failed to send reminder", "error");
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <Send size={18} />
            </div>
            <h3 className="font-semibold text-gray-900 text-lg">Send Message</h3>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Recipient</label>
            <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-medium flex items-center">
              <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
              {clientName || `Client #${clientId}`}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <AlignLeft size={16} className="text-gray-400" /> Templates
            </label>
            <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => applyTemplate("OVERDUE")}
                className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors"
              >
                Overdue Invoice
              </button>
              <button 
                onClick={() => applyTemplate("CONFIRMATION")}
                className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
              >
                Job Confirmation
              </button>
              <button 
                onClick={() => applyTemplate("FOLLOW_UP")}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
              >
                Follow-up
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message Content</label>
            <textarea 
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message or select a template..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm resize-none shadow-sm"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            disabled={isPending}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            disabled={isPending || !message.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {isPending ? "Sending..." : "Send Message"}
            {!isPending && <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
}
