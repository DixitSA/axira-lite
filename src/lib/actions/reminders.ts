"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function sendReminder(data: {
  businessId: number;
  clientId: number;
  invoiceId?: number;
  jobId?: number;
  content: string;
}) {
  if (!data.clientId || !data.content) {
    throw new Error("Client ID and content are required.");
  }

  // Simulate sending an SMS by writing to the database
  await db.reminderMessage.create({
    data: {
      businessId: data.businessId,
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
