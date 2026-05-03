import { STATUS_COLORS } from "@/lib/utils/constants";

interface StatusBadgeProps {
  status: string;
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}
    >
      {formatStatus(status)}
    </span>
  );
}
