import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/page-header";
import StatusBadge from "@/components/ui/status-badge";
import KpiCard from "@/components/ui/kpi-card";
import { formatCurrency, formatDate, formatRelativeDate, formatPhone } from "@/lib/utils/format";
import { computeClientHealth } from "@/lib/utils/client-health";
import { DollarSign, Clock, Briefcase, AlertCircle, Phone, Mail, MapPin, Building2 } from "lucide-react";
import Link from "next/link";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { businessId } = await getAuthenticatedUser();
  const { id } = await params;
  const clientId = parseInt(id, 10);

  if (isNaN(clientId)) notFound();

  const client = await db.client.findFirst({
    where: { id: clientId, businessId },
    include: {
      jobs: {
        orderBy: { scheduledStart: "desc" },
        take: 10,
      },
      invoices: {
        orderBy: { dueDate: "desc" },
        take: 10,
        include: { job: true },
      },
      reminderMessages: {
        orderBy: { sentAt: "desc" },
        take: 5,
      },
    },
  });

  if (!client) notFound();

  const healthStatus = computeClientHealth(client.lastJobAt);
  const completedJobs = client.jobs.filter((j: any) => j.status === "COMPLETED").length;
  const activeJobs = client.jobs.filter((j: any) => j.status === "SCHEDULED" || j.status === "IN_PROGRESS").length;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader
        title={`${client.firstName} ${client.lastName}`}
        description={
          <>
            <StatusBadge status={healthStatus} />
            {client.companyName && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-tight">{client.companyName}</span>
            )}
          </>
        }
      >
        <Link
          href="/clients"
          className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Clients
        </Link>
      </PageHeader>

      <div className="p-6 space-y-8 max-w-[1600px] mx-auto w-full">
        {/* Contact Info + KPIs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Contact Card */}
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Phone size={14} className="text-gray-400 flex-shrink-0" />
                <span className="text-sm font-bold text-gray-900 tabular-nums">{formatPhone(client.phone)}</span>
              </div>
              {client.email && (
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{client.email}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{client.address}</span>
                </div>
              )}
              {client.companyName && (
                <div className="flex items-center gap-3">
                  <Building2 size={14} className="text-gray-400 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700">{client.companyName}</span>
                </div>
              )}
            </div>
            {client.notes && (
              <div className="pt-3 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Notes</p>
                <p className="text-sm text-gray-600 leading-relaxed">{client.notes}</p>
              </div>
            )}
          </div>

          {/* KPI Row */}
          <div className="lg:col-span-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard label="Total Revenue" value={formatCurrency(client.totalRevenue)} icon={DollarSign} />
            <KpiCard
              label="Outstanding"
              value={formatCurrency(client.outstandingBalance)}
              icon={Clock}
              trendType={client.outstandingBalance > 0 ? "negative" : "neutral"}
            />
            <KpiCard label="Active Jobs" value={activeJobs} icon={Briefcase} />
            <KpiCard label="Completed" value={completedJobs} icon={AlertCircle} />
          </div>
        </div>

        {/* Job History + Invoice History */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Jobs */}
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Job History</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {client.jobs.length} Jobs
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {client.jobs.length > 0 ? (
                client.jobs.map((job: any) => (
                  <Link
                    key={job.id}
                    href={`/jobs/${job.id}`}
                    className="p-4 px-5 flex items-center justify-between hover:bg-blue-50/30 transition-colors group"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">
                        {job.title}
                      </span>
                      <span className="text-xs font-bold text-gray-500 tabular-nums">
                        {formatDate(job.scheduledStart)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {(job.finalAmount || job.quotedAmount) && (
                        <span className="text-sm font-bold text-gray-900 tabular-nums">
                          {formatCurrency(job.finalAmount || job.quotedAmount)}
                        </span>
                      )}
                      <StatusBadge status={job.status} />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No jobs recorded</p>
                </div>
              )}
            </div>
          </section>

          {/* Invoices */}
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Invoice History</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {client.invoices.length} Invoices
              </span>
            </div>
            <div className="divide-y divide-gray-100">
              {client.invoices.length > 0 ? (
                client.invoices.map((inv: any) => (
                  <div
                    key={inv.id}
                    className={`p-4 px-5 flex items-center justify-between hover:bg-blue-50/30 transition-colors ${
                      inv.status === "OVERDUE" ? "bg-red-50/30" : ""
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-bold text-gray-900 tracking-tight tabular-nums">
                        {inv.invoiceNumber}
                      </span>
                      <span className="text-xs font-medium text-gray-500">
                        {inv.job ? inv.job.title : "Standalone"} · Due {formatDate(inv.dueDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 tabular-nums">
                        {formatCurrency(inv.amount)}
                      </span>
                      <StatusBadge status={inv.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center">
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No invoices issued</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Communication Log */}
        <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Communication Log</h2>
            <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              {client.reminderMessages.length} Messages
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {client.reminderMessages.length > 0 ? (
              client.reminderMessages.map((msg: any) => (
                <div key={msg.id} className="p-4 px-5 flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 leading-relaxed truncate">{msg.content}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={msg.status} />
                    <span className="text-xs font-bold text-gray-400 tabular-nums whitespace-nowrap">
                      {formatRelativeDate(msg.sentAt)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No messages sent</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
