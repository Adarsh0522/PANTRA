import { getUserProfile, updateProfile } from "./actions";

export default async function ProfilePage() {
  const profile = await getUserProfile();

  return (
    <div className="min-h-screen bg-[#0A0F1C] py-12 px-4 sm:px-6 lg:px-8 text-white">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>

        <div className="bg-[#111827] shadow rounded-lg border border-gray-800 p-6 sm:p-8">
          <form action={updateProfile} className="space-y-6">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-100">
                PAN Generator Configuration
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                These settings will be used automatically when generating PAN Forms.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
              <div className="sm:col-span-2">
                <label htmlFor="ao_code" className="block text-sm font-medium text-gray-300">
                  AO Code
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="ao_code"
                    id="ao_code"
                    defaultValue={profile?.ao_code || ""}
                    placeholder="e.g. DLW-72-1"
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#1F2937] text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="office_address" className="block text-sm font-medium text-gray-300">
                  Office Address
                </label>
                <div className="mt-1">
                  <textarea
                    id="office_address"
                    name="office_address"
                    rows={3}
                    defaultValue={profile?.office_address || ""}
                    placeholder="Full registered office address"
                    className="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-[#1F2937] text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900"
              >
                Save Settings
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
