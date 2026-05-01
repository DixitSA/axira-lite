import Link from "next/link";
import { ChevronRight, AlertCircle, Calendar, Clock, UserCheck } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

interface ActionCardProps {
  type: string;
  title: string;
  description: string;
  priority: number;
  count: number;
  amount?: number;
  href: string;
}

const ACTION_ICONS: Record<string, any> = {
  overdue_invoices: AlertCircle,
  uninvoiced_jobs: Clock,
  at_risk_clients: UserCheck,
  due_soon_invoices: AlertCircle,
  today_jobs: Calendar,
  tomorrow_jobs: Calendar,
};


export default function ActionCard({
  type,
  title,
  description,
  priority,
  amount,
  href,
}: ActionCardProps) {
  const Icon = ACTION_ICONS[type] || AlertCircle;
  
  // OKLCH-based priority colors for "Precision Cockpit"
  const priorityColor = priority <= 2 
    ? "text-red-600 bg-red-50" 
    : priority <= 4 
    ? "text-amber-600 bg-amber-50" 
    : "text-blue-600 bg-blue-50";

  return (
    <Link
      href={href}
      className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-5 transition-all hover:border-blue-500 group"
    >
      <div className="flex items-center gap-5">
        <div className={`p-2.5 rounded-lg ${priorityColor} transition-all`}>
          <Icon size={22} strokeWidth={2.5} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-gray-900 tracking-tight">{title}</h4>
          <p className="text-xs text-gray-500 font-medium leading-normal">
            {description}
            {amount !== undefined && (
              <span className="font-bold text-gray-900 ml-1.5 tabular-nums">
                {formatCurrency(amount)}
              </span>
            )}
          </p>
        </div>
      </div>
      <div className="p-2 rounded-full bg-gray-50 text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
        <ChevronRight size={16} strokeWidth={3} />
      </div>
    </Link>
  );
}
