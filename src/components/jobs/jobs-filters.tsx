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

  // Keyboard shortcut: Press / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        document.getElementById("job-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <div className="relative max-w-md w-full flex-1 group">
        <label htmlFor="job-search" className="sr-only">Search jobs</label>
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <input
          id="job-search"
          type="text"
          placeholder="Search client or title... (Press /)"
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition-all"
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
              className={`px-3 py-1 rounded-full text-xs font-bold transition-colors uppercase tracking-wider border ${
                statuses.includes(status)
                  ? "bg-primary text-white border-primary"
                  : "bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200"
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
