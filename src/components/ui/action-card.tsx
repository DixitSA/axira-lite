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

const PRIORITY_COLORS: Record<number, string> = {
  1: "border-red-500",
  2: "border-amber-500",
  3: "border-amber-400",
  4: "border-blue-500",
  5: "border-blue-400",
  6: "border-gray-400",
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
  const borderColor = PRIORITY_COLORS[priority] || "border-gray-200";

  return (
    <Link
      href={href}
      className={`block bg-white border-l-4 ${borderColor} border-t border-r border-b border-gray-200 rounded-r-lg p-4 transition-all hover:bg-gray-50 group`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-50 rounded-full text-gray-500 group-hover:text-blue-600 transition-colors">
            <Icon size={20} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
            <p className="text-sm text-gray-500">
              {description}
              {amount !== undefined && (
                <span className="font-medium text-gray-900 ml-1">
                  ({formatCurrency(amount)})
                </span>
              )}
            </p>
          </div>
        </div>
        <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
      </div>
    </Link>
  );
}
