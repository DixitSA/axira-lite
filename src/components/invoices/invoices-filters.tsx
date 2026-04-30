"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Search } from "lucide-react";

const INVOICE_STATUSES = ["OVERDUE", "PENDING", "PAID", "DRAFT", "VOID"];

export default function InvoicesFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Local state for debounced search
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const statusParam = searchParams.get("status") || "ALL";

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      createQueryString("search", search || null);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value === null) {
        params.delete(name);
      } else {
        params.set(name, value);
      }
      
      router.push(pathname + "?" + params.toString());
    },
    [pathname, router, searchParams]
  );

  return (
    <div className="bg-white p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
      {/* Search */}
      <div className="relative max-w-md w-full sm:w-auto flex-1">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search client or invoice #..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Status Filter */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-500 font-medium">Status:</span>
          <select
            className="pl-3 pr-8 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 bg-white"
            value={statusParam}
            onChange={(e) => createQueryString("status", e.target.value === "ALL" ? null : e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            {INVOICE_STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
