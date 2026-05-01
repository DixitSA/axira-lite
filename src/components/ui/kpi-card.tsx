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
    <div className="bg-white border border-gray-200 rounded-lg p-5 group hover:border-blue-500 transition-colors flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-widest leading-none">
          {label}
        </span>
        {Icon && (
          <div className="text-gray-300 group-hover:text-blue-600 transition-colors">
            <Icon size={14} strokeWidth={2.5} />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold text-gray-900 tracking-tighter tabular-nums leading-none">
          {value}
        </span>
        {trend && (
          <span className={`text-[11px] font-bold tabular-nums ${
            trendType === "positive" ? "text-green-600" : trendType === "negative" ? "text-red-600" : "text-gray-400"
          }`}>
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
