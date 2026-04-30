"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function markJobInProgress(jobId: number) {
  const { businessId } = await getAuthenticatedUser();
  
  // Verify ownership
  const job = await db.job.findFirst({ where: { id: jobId, businessId } });
  if (!job) throw new Error("Job not found or access denied");

  await db.job.update({
    where: { id: jobId },
    data: { status: "IN_PROGRESS" },
  });
  
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function markJobComplete(jobId: number) {
  const { businessId } = await getAuthenticatedUser();
  
  const job = await db.job.findFirst({ where: { id: jobId, businessId } });
  if (!job) throw new Error("Job not found or access denied");

  await db.job.update({
    where: { id: jobId },
    data: { 
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });
  
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}

export async function createInvoiceForJob(jobId: number) {
  const { businessId } = await getAuthenticatedUser();

  const job = await db.job.findFirst({
    where: { id: jobId, businessId },
    include: { client: true },
  });

  if (!job) throw new Error("Job not found or access denied");
  if (job.status !== "COMPLETED") throw new Error("Job must be completed to invoice");
  if (job.invoicedAt) throw new Error("Job already invoiced");

  const amount = job.finalAmount || job.quotedAmount || 0;
  
  // Generate invoice number: INV-YYYYMMDD-ID
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const invoiceNumber = `INV-${dateStr}-${jobId.toString().padStart(4, "0")}`;

  const issueDate = new Date();
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // Net 30

  // Run in transaction to ensure consistency
  await db.$transaction([
    db.invoice.create({
      data: {
        businessId,
        clientId: job.clientId,
        jobId: job.id,
        invoiceNumber,
        amount,
        issueDate,
        dueDate,
        status: "PENDING",
      },
    }),
    db.job.update({
      where: { id: jobId },
      data: { invoicedAt: new Date() },
    }),
  ]);

  revalidatePath("/jobs");
  revalidatePath("/invoices");
  revalidatePath("/dashboard");
}

export async function cancelJob(jobId: number) {
  const { businessId } = await getAuthenticatedUser();
  
  const job = await db.job.findFirst({ where: { id: jobId, businessId } });
  if (!job) throw new Error("Job not found or access denied");

  await db.job.update({
    where: { id: jobId },
    data: { status: "CANCELLED" },
  });
  
  revalidatePath("/jobs");
  revalidatePath("/dashboard");
}
