import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/page-header";
import StatusBadge from "@/components/ui/status-badge";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils/format";
import { MapPin, Clock, DollarSign, FileText, User } from "lucide-react";
import Link from "next/link";
import JobDetailActions from "@/components/jobs/job-detail-actions";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { businessId } = await getAuthenticatedUser();
  const { id } = await params;
  const jobId = parseInt(id, 10);
  if (isNaN(jobId)) notFound();

  const job = await db.job.findFirst({
    where: { id: jobId, businessId },
    include: { client: true, invoices: { orderBy: { createdAt: "desc" } } },
  });
  if (!job) notFound();

  const amount = job.finalAmount || job.quotedAmount;
  const hasInvoice = job.invoicedAt !== null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title={job.title} description={<><StatusBadge status={job.status} /><span className="text-xs font-bold text-gray-400 tabular-nums">{formatDate(job.scheduledStart)}</span></>}>
        <div className="flex items-center gap-3">
          <JobDetailActions jobId={job.id} status={job.status} hasInvoice={hasInvoice} />
          <Link href="/jobs" className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">Back to Jobs</Link>
        </div>
      </PageHeader>
      <div className="p-6 space-y-8 max-w-[1600px] mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-lg p-5 space-y-5">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Job Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <MapPin size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Address</p><p className="text-sm font-medium text-gray-900">{job.address}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Schedule</p><p className="text-sm font-bold text-gray-900 tabular-nums">{formatDate(job.scheduledStart)} · {formatTime(job.scheduledStart)}</p>{job.scheduledEnd && <p className="text-xs text-gray-500 tabular-nums">to {formatTime(job.scheduledEnd)}</p>}</div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Amount</p><p className="text-sm font-bold text-gray-900 tabular-nums">{amount != null ? formatCurrency(amount) : "Not quoted"}</p></div>
              </div>
              <div className="flex items-start gap-3">
                <FileText size={14} className="text-gray-400 flex-shrink-0 mt-0.5" />
                <div><p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Invoice</p><p className={`text-sm font-bold ${hasInvoice ? "text-green-600" : "text-amber-600"}`}>{hasInvoice ? "Invoiced" : job.status === "COMPLETED" ? "Awaiting Invoice" : "N/A"}</p></div>
              </div>
            </div>
            {job.description && <div className="pt-4 border-t border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Description</p><p className="text-sm text-gray-700 leading-relaxed">{job.description}</p></div>}
            {job.internalNotes && <div className="pt-4 border-t border-gray-100"><p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Internal Notes</p><p className="text-sm text-gray-700 leading-relaxed">{job.internalNotes}</p></div>}
          </div>
          <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-3">Client</h3>
            <Link href={`/clients/${job.client.id}`} className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">{job.client.firstName[0]}{job.client.lastName[0]}</div>
              <div><p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors tracking-tight">{job.client.firstName} {job.client.lastName}</p>{job.client.companyName && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">{job.client.companyName}</p>}</div>
            </Link>
            <div className="pt-3 border-t border-gray-100 space-y-2">
              <div className="flex items-center gap-2 text-sm"><User size={12} className="text-gray-400" /><span className="font-bold text-gray-700 tabular-nums">{job.client.phone}</span></div>
              {job.client.email && <div className="flex items-center gap-2 text-sm"><FileText size={12} className="text-gray-400" /><span className="font-medium text-gray-700">{job.client.email}</span></div>}
            </div>
          </div>
        </div>
        {job.invoices.length > 0 && (
          <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Linked Invoices</h2>
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{job.invoices.length}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {job.invoices.map((inv: any) => (
                <div key={inv.id} className={`p-4 px-5 flex items-center justify-between ${inv.status === "OVERDUE" ? "bg-red-50/30" : ""}`}>
                  <div className="flex flex-col gap-0.5"><span className="text-sm font-bold text-gray-900 tabular-nums">{inv.invoiceNumber}</span><span className="text-xs text-gray-500">Due {formatDate(inv.dueDate)}</span></div>
                  <div className="flex items-center gap-3"><span className="text-sm font-bold text-gray-900 tabular-nums">{formatCurrency(inv.amount)}</span><StatusBadge status={inv.status} /></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
