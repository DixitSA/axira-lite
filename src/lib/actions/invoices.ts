"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

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
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { amount: true, clientId: true, status: true },
  });

  if (!invoice) throw new Error("Invoice not found");
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
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    select: { clientId: true, status: true },
  });

  if (!invoice) throw new Error("Invoice not found");
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
