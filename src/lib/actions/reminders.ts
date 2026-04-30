"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function sendReminder(data: {
  clientId: number;
  invoiceId?: number;
  jobId?: number;
  content: string;
}) {
  const { businessId } = await getAuthenticatedUser();

  if (!data.clientId || !data.content) {
    throw new Error("Client ID and content are required.");
  }

  // Verify client belongs to this business
  const client = await db.client.findFirst({
    where: { id: data.clientId, businessId },
  });
  if (!client) throw new Error("Client not found or access denied");

  // Simulate sending an SMS by writing to the database
  await db.reminderMessage.create({
    data: {
      businessId,
      clientId: data.clientId,
      invoiceId: data.invoiceId,
      jobId: data.jobId,
      content: data.content,
      status: "SENT",
      sentAt: new Date(),
    },
  });

  revalidatePath("/reminders");
  revalidatePath("/dashboard");
}
