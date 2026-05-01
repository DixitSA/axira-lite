"use client";

import { useState, useEffect, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Users, Briefcase, FileText, X, CornerDownLeft } from "lucide-react";
import { globalSearch, type SearchResult } from "@/lib/actions/search";

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Auto-focus input when opening
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      // Small delay to ensure the modal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timeout = setTimeout(() => {
      startTransition(async () => {
        const data = await globalSearch(query);
        setResults(data);
        setSelectedIndex(0);
      });
    }, 200);

    return () => clearTimeout(timeout);
  }, [query]);

  const navigate = useCallback(
    (result: SearchResult) => {
      setIsOpen(false);
      router.push(result.href);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      e.preventDefault();
      navigate(results[selectedIndex]);
    }
  };

  const typeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "client":
        return <Users size={14} className="text-blue-600 flex-shrink-0" />;
      case "job":
        return <Briefcase size={14} className="text-amber-600 flex-shrink-0" />;
      case "invoice":
        return <FileText size={14} className="text-green-600 flex-shrink-0" />;
    }
  };

  const typeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "client": return "Client";
      case "job": return "Job";
      case "invoice": return "Invoice";
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/60 cmd-palette-backdrop"
        onClick={() => setIsOpen(false)}
      />

      {/* Palette */}
      <div className="relative flex items-start justify-center pt-[15vh]">
        <div className="w-full max-w-lg bg-white border border-gray-200 rounded-lg overflow-hidden cmd-palette-enter">
          {/* Search input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search clients, jobs, invoices..."
              className="flex-1 text-sm text-gray-900 placeholder-gray-400 outline-none bg-transparent"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-[320px] overflow-y-auto">
            {isPending && query.length >= 2 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                Searching...
              </div>
            )}

            {!isPending && query.length >= 2 && results.length === 0 && (
              <div className="px-4 py-8 text-center text-sm text-gray-400">
                No results for "{query}"
              </div>
            )}

            {results.length > 0 && (
              <div className="py-1">
                {results.map((result, index) => (
                  <button
                    key={`${result.type}-${result.id}`}
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                      index === selectedIndex
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {typeIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {result.title}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {result.subtitle}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider flex-shrink-0">
                      {typeLabel(result.type)}
                    </span>
                    {index === selectedIndex && (
                      <CornerDownLeft size={12} className="text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {query.length < 2 && (
              <div className="px-4 py-6">
                <p className="text-xs text-gray-400 mb-3 uppercase tracking-wider font-medium">Quick actions</p>
                <div className="space-y-1">
                  <button
                    onClick={() => { setIsOpen(false); router.push("/clients"); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Users size={14} /> View All Clients
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); router.push("/jobs"); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <Briefcase size={14} /> View All Jobs
                  </button>
                  <button
                    onClick={() => { setIsOpen(false); router.push("/invoices"); }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <FileText size={14} /> View All Invoices
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">↑↓</kbd>
              navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">↵</kbd>
              open
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 py-0.5 bg-gray-100 border border-gray-200 rounded text-[9px] font-mono">esc</kbd>
              close
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
