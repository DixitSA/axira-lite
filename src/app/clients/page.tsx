import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import ClientsFilters from "@/components/clients/clients-filters";
import ClientsTable from "@/components/clients/clients-table";
import AddClientButton from "@/components/clients/add-client-button";
import { Prisma } from "@prisma/client";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { businessId } = await getAuthenticatedUser();
  const params = await searchParams;
  
  const search = typeof params.search === "string" ? params.search : undefined;
  
  const sortField = typeof params.sort === "string" ? params.sort : "lastJobAt";
  const sortDir = typeof params.dir === "string" ? params.dir : "desc";

  // Build the Prisma where clause
  const where: Prisma.ClientWhereInput = { businessId };

  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { companyName: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
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
        <AddClientButton />
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
