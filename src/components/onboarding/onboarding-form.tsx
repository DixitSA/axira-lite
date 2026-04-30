"use client";

import { useFormStatus } from "react-dom";
import { createBusiness } from "@/lib/actions/onboarding";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-primary text-white py-2.5 px-4 rounded-md text-sm font-medium transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? "Creating..." : "Create Business"}
    </button>
  );
}

export default function OnboardingForm() {
  return (
    <form action={createBusiness} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Business Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder="e.g. Apex Detail Co."
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="industryType" className="block text-sm font-medium text-gray-700 mb-1">
          Industry
        </label>
        <select
          id="industryType"
          name="industryType"
          required
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        >
          <option value="">Select an industry</option>
          <option value="Auto Detailing">Auto Detailing</option>
          <option value="Cleaning">Cleaning</option>
          <option value="HVAC">HVAC</option>
          <option value="Landscaping">Landscaping</option>
          <option value="Painting">Painting</option>
          <option value="Plumbing">Plumbing</option>
          <option value="Electrical">Electrical</option>
          <option value="General Contracting">General Contracting</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          required
          placeholder="5551234567"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="hello@yourbusiness.com"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
        />
      </div>

      <SubmitButton />
    </form>
  );
}
