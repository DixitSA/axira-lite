import { LucideIcon } from "lucide-react";

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  trend,
  trendType = "neutral",
}: KpiCardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col justify-between h-full hover:border-primary/40 transition-colors group">
      <div>
        <div className="flex items-center gap-2 mb-3">
          {Icon && (
            <div className="p-1.5 bg-gray-50 rounded text-gray-400 group-hover:text-primary transition-colors">
              <Icon size={16} />
            </div>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            {label}
          </p>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight tabular-nums">
          {value}
        </h3>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-1.5">
          <div className={`h-1 w-1 rounded-full ${
            trendType === "positive" ? "bg-status-completed-text" : trendType === "negative" ? "bg-status-overdue-text" : "bg-gray-400"
          }`} />
          <p className={`text-[11px] font-medium ${
            trendType === "positive" ? "text-status-completed-text" : trendType === "negative" ? "text-status-overdue-text" : "text-gray-500"
          }`}>
            {trend}
          </p>
        </div>
      )}
    </div>
  );
}
