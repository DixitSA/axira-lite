"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface ComposeModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientId?: number;
  invoiceId?: number;
  clientName?: string;
}

export default function ComposeModal({ isOpen, onClose, clientId, invoiceId, clientName }: ComposeModalProps) {
  const [message, setMessage] = useState("");

  if (!isOpen) return null;

  const handleSend = () => {
    alert(`Reminder placeholder! Would send to Client ${clientId} (Invoice ${invoiceId})`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Send Reminder</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-4 flex-1">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input 
              type="text" 
              readOnly 
              value={clientName || `Client #${clientId}`} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea 
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your reminder message here..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 flex justify-end gap-2">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSend}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
