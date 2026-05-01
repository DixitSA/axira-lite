import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import PageHeader from "@/components/layout/page-header";
import InvoiceDocument from "@/components/invoices/invoice-document";
import Link from "next/link";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { businessId } = await getAuthenticatedUser();
  const { id } = await params;
  const invoiceId = parseInt(id, 10);

  if (isNaN(invoiceId)) notFound();

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, businessId },
    include: {
      client: true,
      job: true,
      business: true,
    },
  });

  if (!invoice) notFound();

  return (
    <div className="flex flex-col min-h-screen">
      <div className="print:hidden">
        <PageHeader 
          title={`Invoice ${invoice.invoiceNumber}`} 
          description={`Billed to ${invoice.client.firstName} ${invoice.client.lastName}`}
        >
          <Link
            href="/invoices"
            className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Invoices
          </Link>
        </PageHeader>
      </div>

      <div className="p-6 print:p-0 print:bg-white w-full">
        <InvoiceDocument 
          invoice={invoice} 
          business={invoice.business} 
          client={invoice.client} 
        />
      </div>
    </div>
  );
}
