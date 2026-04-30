import React from "react";
import { SearchX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

export default function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-gray-200 rounded-lg">
      <div className="w-12 h-12 flex items-center justify-center bg-gray-50 text-gray-300 rounded-lg mb-4">
        <SearchX size={28} strokeWidth={1.5} />
      </div>
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
