"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export type AuthenticatedUser = {
  userId: number;
  businessId: number;
  clerkId: string;
  role: string;
};

/**
 * Returns the authenticated user's database record scoped to their business.
 * Redirects to sign-in if not authenticated, or to onboarding if no business exists.
 */
export async function getAuthenticatedUser(): Promise<AuthenticatedUser> {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { clerkId },
  });

  if (!user) {
    redirect("/onboarding");
  }

  return {
    userId: user.id,
    businessId: user.businessId,
    clerkId: user.clerkId,
    role: user.role,
  };
}
