"use server";

import { db } from "@/lib/db";
import { getAuthenticatedUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CreateClientSchema } from "@/lib/validations/schemas";

export type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createClient(formData: FormData): Promise<ActionResult> {
  try {
    const { businessId } = await getAuthenticatedUser();

    const raw = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || "",
      companyName: (formData.get("companyName") as string) || "",
      address: (formData.get("address") as string) || "",
      notes: (formData.get("notes") as string) || "",
    };

    const parsed = CreateClientSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await db.client.create({
      data: {
        businessId,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        companyName: parsed.data.companyName || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to create client" };
  }
}

export async function updateClient(clientId: number, formData: FormData): Promise<ActionResult> {
  try {
    const { businessId } = await getAuthenticatedUser();

    const client = await db.client.findFirst({ where: { id: clientId, businessId } });
    if (!client) return { success: false, error: "Client not found or access denied" };

    const raw = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      phone: formData.get("phone") as string,
      email: (formData.get("email") as string) || "",
      companyName: (formData.get("companyName") as string) || "",
      address: (formData.get("address") as string) || "",
      notes: (formData.get("notes") as string) || "",
    };

    const parsed = CreateClientSchema.safeParse(raw);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message };
    }

    await db.client.update({
      where: { id: clientId },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        companyName: parsed.data.companyName || null,
        address: parsed.data.address || null,
        notes: parsed.data.notes || null,
      },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true };
  } catch {
    return { success: false, error: "Failed to update client" };
  }
}
