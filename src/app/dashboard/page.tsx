import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import KpiCard from "@/components/ui/kpi-card";
import ActionCard from "@/components/ui/action-card";
import StatusBadge from "@/components/ui/status-badge";
import RevenueChart from "@/components/dashboard/revenue-chart";
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

export default async function DashboardPage() {
  const { businessId } = await getAuthenticatedUser();

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
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const monthLabel = monthStart.toLocaleString("en-US", { month: "short" });

    const paidAgg = await db.invoice.aggregate({
      _sum: { paidAmount: true },
      where: { businessId, paidDate: { gte: monthStart, lte: monthEnd } },
    });

    const outstandingAgg = await db.invoice.findMany({
      where: { businessId, status: { in: ["PENDING", "OVERDUE"] }, issueDate: { gte: monthStart, lte: monthEnd } },
      select: { amount: true, paidAmount: true },
    });

    monthlyData.push({
      month: monthLabel,
      revenue: paidAgg._sum.paidAmount || 0,
      outstanding: outstandingAgg.reduce((s, inv) => s + (inv.amount - inv.paidAmount), 0),
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
            <span>{actions.length > 0 ? `${actions.length} items require attention` : 'System status: Nominal'}</span>
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
              trend="Operational track: Clear"
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
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Action Center</h2>
            <span className="h-px flex-1 bg-gray-200/60 ml-6" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {actions.length > 0 ? (
              actions.map((action) => (
                <ActionCard key={action.type} {...action} />
              ))
            ) : (
              <div className="col-span-full bg-white/50 border border-gray-200 border-dashed rounded-lg p-12 text-center">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Operational queue clear</p>
              </div>
            )}
          </div>
        </section>

        {/* Snapshots - Asymmetric Density */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Jobs Snapshot (Relaxed) */}
          <section className="lg:col-span-3 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Upcoming Schedule</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{[...todayJobs, ...tomorrowJobs].length} Active</span>
            </div>
            <div className="divide-y divide-gray-100 flex-1">
              {[...todayJobs, ...tomorrowJobs].length > 0 ? (
                [...todayJobs, ...tomorrowJobs].map((job) => (
                  <div key={job.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="flex flex-col gap-1">
                      <span className="text-base font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                        {job.client.firstName} {job.client.lastName}
                      </span>
                      <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-blue-600 tabular-nums uppercase">{formatTime(job.scheduledStart)}</span>
                         <span className="h-1 w-1 rounded-full bg-gray-300" />
                         <span className="text-xs font-medium text-gray-500">{job.title}</span>
                      </div>
                    </div>
                    <StatusBadge status={job.status} />
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No appointments scheduled</p>
                </div>
              )}
            </div>
          </section>

          {/* Invoices Snapshot (Dense / Industrial) */}
          <section className="lg:col-span-2 bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Flagged Accounts</h2>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-red-600 uppercase">{overdueInvoicesList.length} Overdue</span>
              </div>
            </div>
            <div className="divide-y divide-gray-100 flex-1">
              {overdueInvoicesList.length > 0 ? (
                overdueInvoicesList.map((inv) => (
                  <div key={inv.id} className="p-3 px-5 flex items-center justify-between hover:bg-red-50/30 transition-colors cursor-pointer group">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-gray-900">
                        {inv.client.firstName} {inv.client.lastName}
                      </span>
                      <span className="text-[10px] font-bold text-red-500 uppercase tracking-tight">
                        {formatRelativeDate(inv.dueDate)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold text-red-600 tabular-nums tracking-tighter">
                        {formatCurrency(inv.amount - inv.paidAmount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Accounts current</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
