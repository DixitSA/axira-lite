import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import KpiCard from "@/components/ui/kpi-card";
import ActionCard from "@/components/ui/action-card";
import StatusBadge from "@/components/ui/status-badge";
import RevenueChart from "@/components/dashboard/revenue-chart";
import DashboardSnapshots from "@/components/dashboard/dashboard-snapshots";
import { 
  formatCurrency, 
  formatTime, 
  formatRelativeDate 
} from "@/lib/utils/format";
import { computeDashboardActions } from "@/lib/utils/dashboard-actions";
import { 
  DollarSign, 
  Briefcase, 
  Users, 
  AlertCircle, 
  Clock 
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { businessId } = await getAuthenticatedUser();
  const business = await db.business.findUnique({
    where: { id: businessId },
    select: { name: true },
  });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(now.getDate() - 60);
  const oneTwentyDaysAgo = new Date();
  oneTwentyDaysAgo.setDate(now.getDate() - 120);

  // 1. Revenue This Month
  const revenueThisMonth = await db.invoice.aggregate({
    _sum: { paidAmount: true },
    where: { businessId, paidDate: { gte: startOfMonth } },
  });

  // 2. Outstanding Balance
  const outstandingInvoices = await db.invoice.findMany({
    where: { businessId, status: { in: ["PENDING", "OVERDUE"] } },
    select: { amount: true, paidAmount: true },
  });
  const outstandingBalance = outstandingInvoices.reduce(
    (sum, inv) => sum + (inv.amount - inv.paidAmount),
    0
  );

  // 3. Overdue Amount
  const overdueInvoicesData = await db.invoice.findMany({
    where: { businessId, status: "OVERDUE" },
    select: { amount: true, paidAmount: true },
  });
  const overdueAmount = overdueInvoicesData.reduce(
    (sum, inv) => sum + (inv.amount - inv.paidAmount),
    0
  );

  // 4. Jobs This Week
  const jobsThisWeek = await db.job.count({
    where: {
      businessId,
      scheduledStart: {
        gte: startOfWeek,
        lte: endOfWeek,
      },
    },
  });

  // 5. Active Clients
  const activeClients = await db.client.count({
    where: { businessId, lastJobAt: { gte: thirtyDaysAgo } },
  });

  // 6. At-Risk Clients
  const atRiskClients = await db.client.count({
    where: {
      businessId,
      lastJobAt: {
        lte: sixtyDaysAgo,
        gte: oneTwentyDaysAgo,
      },
    },
  });

  // Revenue Chart: Last 6 months of revenue vs outstanding
  const monthlyData = [];
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  
  const allInvoices = await db.invoice.findMany({
    where: { businessId, issueDate: { gte: sixMonthsAgo } },
    select: { amount: true, paidAmount: true, paidDate: true, issueDate: true },
  });

  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthLabel = monthStart.toLocaleString("en-US", { month: "short" });

    const monthPaid = allInvoices
      .filter(inv => inv.paidDate && inv.paidDate >= monthStart && inv.paidDate <= monthEnd)
      .reduce((sum, inv) => sum + inv.paidAmount, 0);

    const monthOutstanding = allInvoices
      .filter(inv => inv.issueDate >= monthStart && inv.issueDate <= monthEnd && (inv.amount - inv.paidAmount) > 0)
      .reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

    monthlyData.push({
      month: monthLabel,
      revenue: monthPaid,
      outstanding: monthOutstanding,
    });
  }

  // Action Center Calculations
  const overdueInvoicesCount = await db.invoice.count({
    where: { businessId, status: "OVERDUE" },
  });
  const uninvoicedJobsCount = await db.job.count({
    where: {
      businessId,
      status: "COMPLETED",
      invoicedAt: null,
    },
  });
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayStart.getDate() + 1);
  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(todayEnd.getDate() + 1);

  const todayJobsCount = await db.job.count({
    where: { businessId, scheduledStart: { gte: todayStart, lt: todayEnd } },
  });
  const tomorrowJobsCount = await db.job.count({
    where: { businessId, scheduledStart: { gte: todayEnd, lt: tomorrowEnd } },
  });

  const dueSoonDate = new Date();
  dueSoonDate.setDate(now.getDate() + 3);
  const dueSoonInvoices = await db.invoice.findMany({
    where: {
      businessId,
      status: "PENDING",
      dueDate: { gte: now, lte: dueSoonDate },
    },
    select: { amount: true, paidAmount: true },
  });
  const dueSoonTotal = dueSoonInvoices.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);

  const actions = computeDashboardActions({
    overdueInvoices: { count: overdueInvoicesCount, total: overdueAmount },
    uninvoicedJobs: { count: uninvoicedJobsCount },
    todayJobs: { count: todayJobsCount },
    tomorrowJobs: { count: tomorrowJobsCount },
    atRiskClients: { count: atRiskClients },
    dueSoonInvoices: { count: dueSoonInvoices.length, total: dueSoonTotal },
  });

  // Snapshot Lists
  const todayJobs = await db.job.findMany({
    where: { businessId, scheduledStart: { gte: todayStart, lt: todayEnd } },
    include: { client: true },
    orderBy: { scheduledStart: "asc" },
  });

  const tomorrowJobs = await db.job.findMany({
    where: { businessId, scheduledStart: { gte: todayEnd, lt: tomorrowEnd } },
    include: { client: true },
    orderBy: { scheduledStart: "asc" },
  });

  const overdueInvoicesList = await db.invoice.findMany({
    where: { businessId, status: "OVERDUE" },
    include: { client: true },
    orderBy: { dueDate: "asc" },
    take: 5,
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Dashboard" 
        description={
          <>
            <div className={`h-1.5 w-1.5 rounded-full ${actions.length > 0 ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            <span>{actions.length > 0 ? `${actions.length} items require attention` : 'All clear'}</span>
          </>
        }
      />
      
      <div className="p-6 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* KPI Row - Varied Rhythm */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4">
          <div className="md:col-span-2 lg:col-span-4">
            <KpiCard 
              label="Revenue (Month)" 
              value={formatCurrency(revenueThisMonth._sum.paidAmount || 0)} 
              icon={DollarSign}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <KpiCard 
              label="Outstanding" 
              value={formatCurrency(outstandingBalance)} 
              icon={Clock}
            />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <KpiCard 
              label="Overdue" 
              value={formatCurrency(overdueAmount)} 
              icon={AlertCircle}
              trendType="negative"
            />
          </div>
          
          <div className="md:col-span-2 lg:col-span-6">
            <KpiCard
              label="Jobs Scheduled This Week"
              value={jobsThisWeek}
              icon={Briefcase}
            />
          </div>
          <div className="md:col-span-1 lg:col-span-3">
            <KpiCard 
              label="Active Clients" 
              value={activeClients} 
              icon={Users}
            />
          </div>
          <div className="md:col-span-1 lg:col-span-3">
            <KpiCard 
              label="At-Risk" 
              value={atRiskClients} 
              icon={Users}
              trendType="negative"
            />
          </div>
        </div>

        {/* Cash Flow Radar */}
        <RevenueChart monthlyData={monthlyData} />

        {/* Action Center */}
        <section aria-labelledby="action-center-title">
          <div className="flex items-center justify-between mb-4">
            <h2 id="action-center-title" className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em]">Needs Attention</h2>
            <span className="h-px flex-1 bg-gray-200/60 ml-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.length > 0 ? (
              actions.map((action) => (
                <ActionCard key={action.type} {...action} />
              ))
            ) : (
              <div className="col-span-full bg-white/50 border border-gray-200 border-dashed rounded-lg p-12 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">You're all caught up</p>
              </div>
            )}
          </div>
        </section>

        {/* Snapshots - Asymmetric Density */}
        <DashboardSnapshots 
          todayJobs={todayJobs}
          tomorrowJobs={tomorrowJobs}
          overdueInvoices={overdueInvoicesList}
          businessName={business?.name || "Axira Lite"}
        />
      </div>
    </div>
  );
}
