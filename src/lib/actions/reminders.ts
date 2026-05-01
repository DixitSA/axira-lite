"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { sendSms } from "@/lib/sms";

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

  // Send SMS via Twilio (or simulate)
  const smsResult = await sendSms(client.phone, data.content);

  // Record in database regardless of delivery method
  await db.reminderMessage.create({
    data: {
      businessId,
      clientId: data.clientId,
      invoiceId: data.invoiceId,
      jobId: data.jobId,
      content: data.content,
      status: smsResult.success ? "SENT" : "FAILED",
      sentAt: new Date(),
    },
  });

  if (!smsResult.success) {
    throw new Error(smsResult.error || "SMS delivery failed");
  }

  revalidatePath("/reminders");
  revalidatePath("/dashboard");

  return { simulated: smsResult.simulated };
}
