"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";

const JOB_STATUSES = ["SCHEDULED", "IN_PROGRESS", "COMPLETED", "CANCELLED"];
const INVOICE_FILTERS = ["ALL", "INVOICED", "NOT_INVOICED"];

export default function JobsFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debounced search
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const statuses = searchParams.getAll("status");
  const invoiceStatus = searchParams.get("invoiced") || "ALL";

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      createQueryString("search", search || null);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const createQueryString = useCallback(
    (name: string, value: string | string[] | null) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === null) {
        params.delete(name);
      } else if (Array.isArray(value)) {
        params.delete(name);
        value.forEach((v) => params.append(name, v));
      } else {
        params.set(name, value);
      }
      
      // Reset to page 1 on filter change if pagination existed, but we don't have it yet.
      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams]
  );

  const handleStatusToggle = (status: string) => {
    const newStatuses = statuses.includes(status)
      ? statuses.filter((s) => s !== status)
      : [...statuses, status];
    
    // If empty, it deletes the param
    createQueryString("status", newStatuses.length ? newStatuses : null);
  };

  return (
    <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search */}
      <div className="relative max-w-md w-full sm:w-auto">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search client or job title..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Status Multi-select (Simple version as inline pills for visibility) */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">Status:</span>
          {JOB_STATUSES.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusToggle(status)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                statuses.includes(status)
                  ? "bg-blue-100 text-blue-700 border border-blue-200"
                  : "bg-gray-100 text-gray-600 border border-transparent hover:bg-gray-200"
              }`}
            >
              {status.replace("_", " ")}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

        {/* Invoice Filter */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">Invoice:</span>
          <select
            className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            value={invoiceStatus}
            onChange={(e) => createQueryString("invoiced", e.target.value === "ALL" ? null : e.target.value)}
          >
            {INVOICE_FILTERS.map((f) => (
              <option key={f} value={f}>
                {f.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
