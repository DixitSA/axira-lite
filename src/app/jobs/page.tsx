import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import JobsFilters from "@/components/jobs/jobs-filters";
import JobsTable from "@/components/jobs/jobs-table";
import AddJobButton from "@/components/jobs/add-job-button";
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
      { title: { contains: search, mode: "insensitive" } },
      { client: { firstName: { contains: search, mode: "insensitive" } } },
      { client: { lastName: { contains: search, mode: "insensitive" } } },
      { client: { companyName: { contains: search, mode: "insensitive" } } },
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

  // Fetch clients for the job form dropdown
  const clients = await db.client.findMany({
    where: { businessId },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Jobs" 
        description={`${totalJobs} total jobs`}
      >
        <AddJobButton clients={clients} />
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
