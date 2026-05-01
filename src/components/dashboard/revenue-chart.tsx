"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/utils/format";
import { ChevronDown, ChevronUp } from "lucide-react";

interface RevenueChartProps {
  monthlyData: { month: string; revenue: number; outstanding: number }[];
}

export default function RevenueChart({ monthlyData }: RevenueChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!monthlyData.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
        <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No revenue data yet</p>
      </div>
    );
  }

  const maxValue = Math.max(...monthlyData.flatMap((d) => [d.revenue, d.outstanding]), 1);

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Cash Flow Radar</h2>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-all"
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        </div>
        {!isCollapsed && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-revenue" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Collected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-status-outstanding" />
              <span className="text-[10px] font-bold text-gray-400 uppercase">Outstanding</span>
            </div>
          </div>
        )}
      </div>
      {!isCollapsed && (
        <div className="p-5 animate-slide-down">
        <div className="flex items-end gap-2 h-48">
          {monthlyData.map((d, i) => {
            const revHeight = (d.revenue / maxValue) * 100;
            const outHeight = (d.outstanding / maxValue) * 100;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                <div className="w-full flex items-end gap-0.5 h-40">
                  <div
                    className="flex-1 bg-status-revenue/80 rounded-t-sm transition-all group-hover:bg-status-revenue"
                    style={{ height: `${Math.max(revHeight, 2)}%` }}
                    title={`Revenue: ${formatCurrency(d.revenue)}`}
                  />
                  <div
                    className="flex-1 bg-status-outstanding/60 rounded-t-sm transition-all group-hover:bg-status-outstanding"
                    style={{ height: `${Math.max(outHeight, 2)}%` }}
                    title={`Outstanding: ${formatCurrency(d.outstanding)}`}
                  />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d.month}</span>
              </div>
            );
          })}
        </div>
        {/* Summary Row */}
        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Collected</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums tracking-tighter">
              {formatCurrency(monthlyData.reduce((s, d) => s + d.revenue, 0))}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Outstanding</p>
            <p className="text-lg font-bold text-red-600 tabular-nums tracking-tighter">
              {formatCurrency(monthlyData.reduce((s, d) => s + d.outstanding, 0))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
