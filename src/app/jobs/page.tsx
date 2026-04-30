import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import JobsFilters from "@/components/jobs/jobs-filters";
import JobsTable from "@/components/jobs/jobs-table";
import { Prisma } from "@prisma/client";

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { businessId } = await getAuthenticatedUser();
  const params = await searchParams;
  
  const search = typeof params.search === "string" ? params.search : undefined;
  const statusParam = params.status;
  const statuses = Array.isArray(statusParam) 
    ? statusParam 
    : typeof statusParam === "string" 
      ? [statusParam] 
      : undefined;
      
  const invoiced = typeof params.invoiced === "string" ? params.invoiced : undefined;
  
  const sortField = typeof params.sort === "string" ? params.sort : "scheduledStart";
  const sortDir = typeof params.dir === "string" ? params.dir : "desc";

  // Build the Prisma where clause
  const where: Prisma.JobWhereInput = { businessId };

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { client: { firstName: { contains: search } } },
      { client: { lastName: { contains: search } } },
    ];
  }

  if (statuses && statuses.length > 0) {
    where.status = { in: statuses };
  }

  if (invoiced === "INVOICED") {
    where.invoicedAt = { not: null };
  } else if (invoiced === "NOT_INVOICED") {
    where.invoicedAt = null;
    where.status = "COMPLETED"; // Usually "not invoiced" only makes sense for completed jobs
  }

  // Build the Prisma orderBy clause
  let orderBy: Prisma.JobOrderByWithRelationInput = { scheduledStart: "desc" };
  if (sortField === "client") {
    orderBy = { client: { firstName: sortDir as Prisma.SortOrder } };
  } else if (sortField === "title") {
    orderBy = { title: sortDir as Prisma.SortOrder };
  } else if (sortField === "scheduledStart") {
    orderBy = { scheduledStart: sortDir as Prisma.SortOrder };
  } else if (sortField === "amount") {
    // Note: this sorts by finalAmount. QuotedAmount logic is complex in SQL without raw queries, 
    // so we'll use finalAmount. For full correctness we might need custom logic.
    orderBy = { finalAmount: sortDir as Prisma.SortOrder };
  }

  const jobs = await db.job.findMany({
    where,
    include: { client: true },
    orderBy,
  });

  const totalJobs = await db.job.count({ where });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Jobs" 
        description={`${totalJobs} total jobs`}
      >
        <button 
          disabled
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Job
        </button>
      </PageHeader>
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <JobsFilters />
          <JobsTable jobs={jobs} />
        </div>
      </div>
    </div>
  );
}
