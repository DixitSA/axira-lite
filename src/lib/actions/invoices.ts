"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CreateInvoiceSchema } from "@/lib/validations/schemas";

export type ActionResult = {
  success: boolean;
  error?: string;
};

/**
 * Recalculates and updates a client's outstanding balance
 * based on all their PENDING and OVERDUE invoices.
 */
async function updateClientOutstandingBalance(clientId: number) {
  const unpaidInvoices = await db.invoice.findMany({
    where: {
      clientId,
      status: { in: ["PENDING", "OVERDUE"] },
    },
    select: { amount: true, paidAmount: true },
  });

  const newBalance = unpaidInvoices.reduce(
    (sum, inv) => sum + (inv.amount - inv.paidAmount),
    0
  );

  await db.client.update({
    where: { id: clientId },
    data: { outstandingBalance: newBalance },
  });
}

export async function markInvoicePaid(invoiceId: number) {
  const { businessId } = await getAuthenticatedUser();

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, businessId },
    select: { amount: true, clientId: true, status: true },
  });

  if (!invoice) throw new Error("Invoice not found or access denied");
  if (invoice.status === "PAID") throw new Error("Invoice is already paid");
  if (invoice.status === "VOID") throw new Error("Cannot pay a voided invoice");

  // Use a transaction to ensure both invoice and client balance are updated
  await db.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: {
        status: "PAID",
        paidAmount: invoice.amount,
        paidDate: new Date(),
      },
    });

    const unpaidInvoices = await tx.invoice.findMany({
      where: {
        clientId: invoice.clientId,
        status: { in: ["PENDING", "OVERDUE"] },
      },
      select: { amount: true, paidAmount: true },
    });

    const newBalance = unpaidInvoices.reduce(
      (sum, inv) => sum + (inv.amount - inv.paidAmount),
      0
    );

    await tx.client.update({
      where: { id: invoice.clientId },
      data: { outstandingBalance: newBalance },
    });
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
}

export async function voidInvoice(invoiceId: number) {
  const { businessId } = await getAuthenticatedUser();

  const invoice = await db.invoice.findFirst({
    where: { id: invoiceId, businessId },
    select: { clientId: true, status: true },
  });

  if (!invoice) throw new Error("Invoice not found or access denied");
  if (invoice.status === "VOID") throw new Error("Invoice is already voided");

  await db.$transaction(async (tx) => {
    await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: "VOID" },
    });

    const unpaidInvoices = await tx.invoice.findMany({
      where: {
        clientId: invoice.clientId,
        status: { in: ["PENDING", "OVERDUE"] },
      },
      select: { amount: true, paidAmount: true },
    });

    const newBalance = unpaidInvoices.reduce(
      (sum, inv) => sum + (inv.amount - inv.paidAmount),
      0
    );

    await tx.client.update({
      where: { id: invoice.clientId },
      data: { outstandingBalance: newBalance },
    });
  });

  revalidatePath("/invoices");
  revalidatePath("/dashboard");
  revalidatePath("/clients");
}

export async function createInvoice(formData: FormData): Promise<ActionResult> {
  try {
    const { businessId } = await getAuthenticatedUser();

    const raw = {
      clientId: Number(formData.get("clientId")),
      amount: Number(formData.get("amount")),
      dueDate: formData.get("dueDate") as string,
      notes: (formData.get("notes") as string) || "",
    };

    const parsed = CreateInvoiceSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    const client = await db.client.findFirst({ where: { id: parsed.data.clientId, businessId } });
    if (!client) return { success: false, error: "Client not found" };

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const count = await db.invoice.count({ where: { businessId } });
    const invoiceNumber = `INV-${dateStr}-${(count + 1).toString().padStart(4, "0")}`;

    await db.invoice.create({
      data: {
        businessId,
        clientId: parsed.data.clientId,
        invoiceNumber,
        amount: parsed.data.amount,
        issueDate: new Date(),
        dueDate: new Date(parsed.data.dueDate),
        notes: parsed.data.notes || null,
        status: "PENDING",
      },
    });

    // Recalculate client outstanding balance
    const unpaid = await db.invoice.findMany({
      where: { clientId: parsed.data.clientId, status: { in: ["PENDING", "OVERDUE"] } },
      select: { amount: true, paidAmount: true },
    });
    const newBalance = unpaid.reduce((sum, inv) => sum + (inv.amount - inv.paidAmount), 0);
    await db.client.update({
      where: { id: parsed.data.clientId },
      data: { outstandingBalance: newBalance },
    });

    revalidatePath("/invoices");
    revalidatePath("/dashboard");
    revalidatePath("/clients");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create invoice" };
  }
}
