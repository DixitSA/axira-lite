export interface DashboardAction {
  type: string;
  title: string;
  description: string;
  priority: number;
  count: number;
  amount?: number;
  href: string;
}

export interface DashboardActionInput {
  overdueInvoices: { count: number; total: number };
  uninvoicedJobs: { count: number };
  todayJobs: { count: number };
  tomorrowJobs: { count: number };
  atRiskClients: { count: number };
  dueSoonInvoices: { count: number; total: number };
}

export function computeDashboardActions(
  input: DashboardActionInput
): DashboardAction[] {
  const actions: DashboardAction[] = [];

  if (input.overdueInvoices.count > 0) {
    actions.push({
      type: "overdue_invoices",
      title: "Overdue Invoices",
      description: `${input.overdueInvoices.count} invoice${input.overdueInvoices.count === 1 ? "" : "s"} past due`,
      priority: 1,
      count: input.overdueInvoices.count,
      amount: input.overdueInvoices.total,
      href: "/invoices?status=OVERDUE",
    });
  }

  if (input.uninvoicedJobs.count > 0) {
    actions.push({
      type: "uninvoiced_jobs",
      title: "Jobs Need Invoicing",
      description: `${input.uninvoicedJobs.count} completed job${input.uninvoicedJobs.count === 1 ? "" : "s"} without invoice`,
      priority: 2,
      count: input.uninvoicedJobs.count,
      href: "/jobs?status=COMPLETED&invoiced=false",
    });
  }

  if (input.atRiskClients.count > 0) {
    actions.push({
      type: "at_risk_clients",
      title: "At-Risk Clients",
      description: `${input.atRiskClients.count} high-value client${input.atRiskClients.count === 1 ? "" : "s"} need follow-up`,
      priority: 3,
      count: input.atRiskClients.count,
      href: "/clients?health=AT_RISK",
    });
  }

  if (input.dueSoonInvoices.count > 0) {
    actions.push({
      type: "due_soon_invoices",
      title: "Invoices Due Soon",
      description: `${input.dueSoonInvoices.count} invoice${input.dueSoonInvoices.count === 1 ? "" : "s"} due within 3 days`,
      priority: 4,
      count: input.dueSoonInvoices.count,
      amount: input.dueSoonInvoices.total,
      href: "/invoices?status=PENDING",
    });
  }

  if (input.todayJobs.count > 0) {
    actions.push({
      type: "today_jobs",
      title: "Jobs Today",
      description: `${input.todayJobs.count} job${input.todayJobs.count === 1 ? "" : "s"} scheduled today`,
      priority: 5,
      count: input.todayJobs.count,
      href: "/jobs?date=today",
    });
  }

  if (input.tomorrowJobs.count > 0) {
    actions.push({
      type: "tomorrow_jobs",
      title: "Jobs Tomorrow",
      description: `${input.tomorrowJobs.count} job${input.tomorrowJobs.count === 1 ? "" : "s"} scheduled tomorrow`,
      priority: 6,
      count: input.tomorrowJobs.count,
      href: "/jobs?date=tomorrow",
    });
  }

  return actions.sort((a, b) => a.priority - b.priority);
}
