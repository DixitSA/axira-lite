import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import OnboardingForm from "@/components/onboarding/onboarding-form";

export default async function OnboardingPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/sign-in");
  }

  // If user already has a business, skip onboarding
  const existingUser = await db.user.findUnique({ where: { clerkId } });
  if (existingUser) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">Set Up Your Business</h1>
          <p className="mt-2 text-sm text-gray-500">
            Tell us about your business to get started with Axira.
          </p>
        </div>
        <OnboardingForm />
      </div>
    </div>
  );
}
