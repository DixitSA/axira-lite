import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import PageHeader from "@/components/layout/page-header";
import InvoicesFilters from "@/components/invoices/invoices-filters";
import InvoicesTable from "@/components/invoices/invoices-table";
import AddInvoiceButton from "@/components/invoices/add-invoice-button";
import { Prisma } from "@prisma/client";
import { formatCurrency } from "@/lib/utils/format";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { businessId } = await getAuthenticatedUser();
  const params = await searchParams;
  
  const search = typeof params.search === "string" ? params.search : undefined;
  const statusParam = params.status;
  const status = typeof statusParam === "string" && statusParam !== "ALL" ? statusParam : undefined;
      
  const sortField = typeof params.sort === "string" ? params.sort : "dueDate";
  const sortDir = typeof params.dir === "string" ? params.dir : "asc";

  // Build the Prisma where clause
  const where: Prisma.InvoiceWhereInput = { businessId };

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { client: { firstName: { contains: search, mode: "insensitive" } } },
      { client: { lastName: { contains: search, mode: "insensitive" } } },
      { client: { companyName: { contains: search, mode: "insensitive" } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  // Build the Prisma orderBy clause
  let orderBy: Prisma.InvoiceOrderByWithRelationInput = { dueDate: "asc" };
  if (sortField === "invoiceNumber") {
    orderBy = { invoiceNumber: sortDir as Prisma.SortOrder };
  } else if (sortField === "client") {
    orderBy = { client: { firstName: sortDir as Prisma.SortOrder } };
  } else if (sortField === "amount") {
    orderBy = { amount: sortDir as Prisma.SortOrder };
  } else if (sortField === "dueDate") {
    orderBy = { dueDate: sortDir as Prisma.SortOrder };
  }

  const invoices = await db.invoice.findMany({
    where,
    include: { client: true, job: true },
    orderBy,
  });

  const totalInvoices = await db.invoice.count({ where });

  // Calculate outstanding amount across ALL unpaid invoices (not just the filtered ones)
  const allUnpaidInvoices = await db.invoice.findMany({
    where: { businessId, status: { in: ["PENDING", "OVERDUE"] } },
    select: { amount: true, paidAmount: true },
  });
  const outstandingAmount = allUnpaidInvoices.reduce(
    (sum, inv) => sum + (inv.amount - inv.paidAmount),
    0
  );

  // Fetch clients for the invoice form dropdown
  const clients = await db.client.findMany({
    where: { businessId },
    select: { id: true, firstName: true, lastName: true },
    orderBy: { firstName: "asc" },
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader 
        title="Invoices" 
        description={`${totalInvoices} invoices`}
      >
        <div className="flex items-center gap-4">
          <div className="text-right mr-4 hidden sm:block">
            <p className="text-sm text-gray-500 font-medium">Total Outstanding</p>
            <p className="text-xl font-bold text-gray-900">{formatCurrency(outstandingAmount)}</p>
          </div>
          <AddInvoiceButton clients={clients} />
        </div>
      </PageHeader>
      
      <div className="p-6">
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <InvoicesFilters />
          <InvoicesTable invoices={invoices} />
        </div>
      </div>
    </div>
  );
}
