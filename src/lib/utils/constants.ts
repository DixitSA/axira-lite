// Health thresholds (days since last job)
export const HEALTH_THRESHOLDS = {
  ACTIVE: 30,
  WATCH: 60,
  AT_RISK: 120,
} as const;

// Status badge colors — full static Tailwind class strings (never template literals)
export const STATUS_COLORS: Record<string, string> = {
  // Job statuses
  SCHEDULED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-gray-100 text-gray-600",
  // Invoice statuses
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  OVERDUE: "bg-red-100 text-red-700",
  VOID: "bg-gray-100 text-gray-400",
  // Client health statuses
  ACTIVE: "bg-green-100 text-green-700",
  WATCH: "bg-amber-100 text-amber-700",
  AT_RISK: "bg-red-100 text-red-700",
  INACTIVE: "bg-gray-100 text-gray-500",
};
