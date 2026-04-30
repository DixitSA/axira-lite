import { db } from "@/lib/db";
import PageHeader from "@/components/layout/page-header";
import ClientsFilters from "@/components/clients/clients-filters";
import ClientsTable from "@/components/clients/clients-table";
import { Prisma } from "@prisma/client";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams;
  
  const search = typeof params.search === "string" ? params.search : undefined;
  
  const sortField = typeof params.sort === "string" ? params.sort : "lastJobAt";
  const sortDir = typeof params.dir === "string" ? params.dir : "desc";

  // Build the Prisma where clause
  const where: Prisma.ClientWhereInput = {};

  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  // Build the Prisma orderBy clause
  let orderBy: Prisma.ClientOrderByWithRelationInput = { lastJobAt: { sort: "desc", nulls: "last" } };
  
  if (sortField === "firstName") {
    orderBy = { firstName: sortDir as Prisma.SortOrder };
  } else if (sortField === "totalRevenue") {
    orderBy = { totalRevenue: sortDir as Prisma.SortOrder };
  } else if (sortField === "outstandingBalance") {
    orderBy = { outstandingBalance: sortDir as Prisma.SortOrder };
  } else if (sortField === "lastJobAt") {
    orderBy = { lastJobAt: { sort: sortDir as Prisma.SortOrder, nulls: "last" } };
  }

  const clients = await db.client.findMany({
    where,
    orderBy,
  });

  const totalClients = await db.client.count({ where });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Clients" 
        description={`${totalClients} clients`}
      >
        <button 
          disabled
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Add Client
        </button>
      </PageHeader>
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <ClientsFilters />
          <ClientsTable clients={clients} />
        </div>
      </div>
    </div>
  );
}
