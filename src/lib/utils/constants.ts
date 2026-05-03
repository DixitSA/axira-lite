// Health thresholds (days since last job)
export const HEALTH_THRESHOLDS = {
  ACTIVE: 30,
  WATCH: 60,
  AT_RISK: 120,
} as const;

// Status badge colors — full static Tailwind class strings (never template literals)
export const STATUS_COLORS: Record<string, string> = {
  // Job statuses
  SCHEDULED: "bg-status-scheduled-bg text-status-scheduled-text",
  IN_PROGRESS: "bg-status-pending-bg text-status-pending-text",
  COMPLETED: "bg-status-completed-bg text-status-completed-text",
  CANCELLED: "bg-gray-100 text-gray-600",
  // Invoice statuses
  DRAFT: "bg-gray-100 text-gray-600",
  PENDING: "bg-status-pending-bg text-status-pending-text",
  PAID: "bg-status-completed-bg text-status-completed-text",
  OVERDUE: "bg-status-overdue-bg text-status-overdue-text",
  VOID: "bg-gray-100 text-gray-400",
  // Client health statuses
  ACTIVE: "bg-status-completed-bg text-status-completed-text",
  WATCH: "bg-status-pending-bg text-status-pending-text",
  AT_RISK: "bg-status-overdue-bg text-status-overdue-text",
  INACTIVE: "bg-gray-100 text-gray-500",
};

// Legend dot colors for the calendar — saturated accents matching STATUS_COLORS hues
export const CALENDAR_LEGEND_ITEMS = [
  { label: "Scheduled", dotClass: "bg-blue-500" },
  { label: "In Progress", dotClass: "bg-amber-500" },
  { label: "Completed", dotClass: "bg-green-500" },
] as const;
