"use client";

import { useState, useEffect } from "react";
import { X, MessageSquare, Send } from "lucide-react";
import { useSmsLink } from "@/hooks/use-sms-link";

interface SMSComposerProps {
  isOpen: boolean;
  onClose: () => void;
  client: {
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
  businessName: string;
}

export default function SMSComposer({
  isOpen,
  onClose,
  client,
  businessName,
}: SMSComposerProps) {
  const { openSMS, isMobile } = useSmsLink();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (isOpen && client) {
      const template = `Hi ${client.firstName}! We miss you at ${businessName}. Stop by soon — we'd love to see you again. Reply STOP to opt out.`;
      setMessage(template);
    }
  }, [isOpen, client, businessName]);

  if (!isOpen || !client) return null;

  const charCount = message.length;
  const segments = Math.ceil(charCount / 160) || 1;

  const handleOpenMessages = () => {
    openSMS(client.phone, message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 transition-opacity">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col transform transition-all border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <MessageSquare size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-none">New Message</h3>
              {!isMobile && (
                <p className="text-[10px] font-bold text-amber-600 uppercase tracking-tight mt-1">
                  Works best on mobile
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Recipient</label>
            <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {client.firstName} {client.lastName}
              </div>
              <span className="text-xs text-gray-400 tabular-nums">{client.phone}</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Message Content</label>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-tight ${charCount > 160 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {charCount} chars
                </span>
                <span className="text-[10px] font-bold text-gray-300">/</span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                  {segments} segment{segments !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <textarea
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 text-sm font-medium resize-none shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleOpenMessages}
            disabled={!message.trim()}
            className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            Open in Messages
            <Send size={14} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
