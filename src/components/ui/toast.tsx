"use client";

import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle } from "lucide-react";

type ToastType = "success" | "error";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;
const listeners: Set<(toast: Toast) => void> = new Set();

export function showToast(message: string, type: ToastType = "success") {
  const toast: Toast = { id: ++toastId, message, type };
  listeners.forEach((fn) => fn(toast));
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Toast) => {
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== toast.id));
    }, 4000);
  }, []);

  useEffect(() => {
    listeners.add(addToast);
    return () => {
      listeners.delete(addToast);
    };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border text-sm font-medium animate-slide-up ${
            toast.type === "success"
              ? "bg-white border-green-200 text-green-800"
              : "bg-white border-red-200 text-red-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="ml-2 text-gray-400 hover:text-gray-600"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
