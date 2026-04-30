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
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            {label}
          </p>
          <h3 className="text-3xl font-semibold text-gray-900 mt-2">{value}</h3>
          {trend && (
            <p
              className={`text-xs font-medium mt-2 ${
                trendType === "positive"
                  ? "text-green-600"
                  : trendType === "negative"
                  ? "text-red-600"
                  : "text-gray-500"
              }`}
            >
              {trend}
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
            <Icon size={20} />
          </div>
        )}
      </div>
    </div>
  );
}
