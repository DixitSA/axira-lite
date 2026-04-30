"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CreateJobSchema } from "@/lib/validations/schemas";

export type ActionResult = {
  success: boolean;
  error?: string;
};

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

export async function createJob(formData: FormData): Promise<ActionResult> {
  try {
    const { businessId } = await getAuthenticatedUser();

    const raw = {
      clientId: Number(formData.get("clientId")),
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || "",
      address: formData.get("address") as string,
      scheduledStart: formData.get("scheduledStart") as string,
      scheduledEnd: (formData.get("scheduledEnd") as string) || "",
      quotedAmount: formData.get("quotedAmount") ? Number(formData.get("quotedAmount")) : undefined,
    };

    const parsed = CreateJobSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const client = await db.client.findFirst({ where: { id: parsed.data.clientId, businessId } });
    if (!client) return { success: false, error: "Client not found" };

    await db.job.create({
      data: {
        businessId,
        clientId: parsed.data.clientId,
        title: parsed.data.title,
        description: parsed.data.description || null,
        address: parsed.data.address,
        scheduledStart: new Date(parsed.data.scheduledStart),
        scheduledEnd: parsed.data.scheduledEnd ? new Date(parsed.data.scheduledEnd) : null,
        quotedAmount: parsed.data.quotedAmount || null,
      },
    });

    await db.client.update({
      where: { id: parsed.data.clientId },
      data: { lastJobAt: new Date(parsed.data.scheduledStart) },
    });

    revalidatePath("/jobs");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create job" };
  }
}
