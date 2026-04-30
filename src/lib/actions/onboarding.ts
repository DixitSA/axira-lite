"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function createBusiness(formData: FormData) {
  const { userId: clerkId } = await auth();
  if (!clerkId) throw new Error("Not authenticated");

  const name = formData.get("name") as string;
  const industryType = formData.get("industryType") as string;
  const phone = formData.get("phone") as string;
  const email = formData.get("email") as string;

  if (!name || !industryType || !phone || !email) {
    throw new Error("All fields are required");
  }

  // Check if user already has a business
  const existingUser = await db.user.findUnique({ where: { clerkId } });
  if (existingUser) {
    redirect("/dashboard");
  }

  // Create business and user in a transaction
  await db.$transaction(async (tx) => {
    const business = await tx.business.create({
      data: { name, industryType, phone, email },
    });

    await tx.user.create({
      data: {
        clerkId,
        businessId: business.id,
        role: "OWNER",
      },
    });
  });

  redirect("/dashboard");
}
