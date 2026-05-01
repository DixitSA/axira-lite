"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";

export type SearchResult = {
  type: "client" | "job" | "invoice";
  id: number;
  title: string;
  subtitle: string;
  href: string;
};

export async function globalSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 2) return [];

  const { businessId } = await getAuthenticatedUser();
  const q = query.trim();
  const results: SearchResult[] = [];

  // Search clients
  const clients = await db.client.findMany({
    where: {
      businessId,
      OR: [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
        { companyName: { contains: q, mode: "insensitive" } },
        { phone: { contains: q } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 5,
    select: { id: true, firstName: true, lastName: true, companyName: true, phone: true },
  });

  for (const c of clients) {
    results.push({
      type: "client",
      id: c.id,
      title: `${c.firstName} ${c.lastName}`,
      subtitle: c.companyName || c.phone,
      href: "/clients",
    });
  }

  // Search jobs
  const jobs = await db.job.findMany({
    where: {
      businessId,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { address: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 5,
    include: { client: { select: { firstName: true, lastName: true } } },
  });

  for (const j of jobs) {
    results.push({
      type: "job",
      id: j.id,
      title: j.title,
      subtitle: `${j.client.firstName} ${j.client.lastName}`,
      href: "/jobs",
    });
  }

  // Search invoices
  const invoices = await db.invoice.findMany({
    where: {
      businessId,
      OR: [
        { invoiceNumber: { contains: q, mode: "insensitive" } },
      ],
    },
    take: 5,
    include: { client: { select: { firstName: true, lastName: true } } },
  });

  for (const inv of invoices) {
    results.push({
      type: "invoice",
      id: inv.id,
      title: inv.invoiceNumber,
      subtitle: `${inv.client.firstName} ${inv.client.lastName}`,
      href: "/invoices",
    });
  }

  return results;
}
