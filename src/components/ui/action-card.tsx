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
  const priorityColor = priority <= 2 
    ? "text-status-overdue-text bg-status-overdue-bg" 
    : priority <= 4 
    ? "text-status-pending-text bg-status-pending-bg" 
    : "text-primary bg-primary/5";

  return (
    <Link
      href={href}
      className="block bg-white border border-gray-200 rounded-lg p-4 transition-all hover:border-blue-300 hover:shadow-sm group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-lg ${priorityColor} transition-colors`}>
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
        <ChevronRight size={18} className="text-gray-400 group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}
