"use client";

import { useActionState } from "react";
import { submitOnboarding } from "./actions";

export default function OnboardingPage() {
  // We use standard form submission mapping to server action
  return (
    <div className="min-h-screen bg-[#0A0F1C] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Complete Your Profile
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          We need a few more details to set up your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[#111827] py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-800">
          <form action={submitOnboarding} className="space-y-6">
            <div>
              <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-300">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  id="mobile_number"
                  name="mobile_number"
                  type="text"
                  required
                  placeholder="Enter 10-digit number"
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#1F2937] text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="center_name" className="block text-sm font-medium text-gray-300">
                Center Name
              </label>
              <div className="mt-1">
                <input
                  id="center_name"
                  name="center_name"
                  type="text"
                  placeholder="e.g. Adarsh Digital CSC"
                  className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#1F2937] text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
              >
                Continue to Dashboard
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
