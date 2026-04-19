import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-blue-50 p-3 rounded-2xl">
              <Shield className="w-8 h-8 text-blue-600" />
           </div>
           <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
              <p className="text-slate-500 font-medium">Last updated: April 2026</p>
           </div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            PANTRA ("we", "our", "us") respects your privacy and is committed to protecting your data.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Information We Collect</h2>
            <p className="text-slate-600 mb-4">We collect only the minimum information required to provide our service:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Mobile number (for login)</li>
              <li>Basic profile details (Name, Email, Center Name)</li>
            </ul>
          </section>

          <section className="mb-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6" /> 2. Applicant Data (Important)
            </h2>
            <p className="text-blue-800 font-medium mb-4">PANTRA does NOT store sensitive applicant data such as:</p>
            <ul className="list-disc pl-6 text-blue-800 space-y-2">
              <li>Aadhaar Number</li>
              <li>PAN Number</li>
              <li>Personal identity details entered in forms</li>
            </ul>
            <p className="mt-4 text-blue-700 italic">All data entered in forms is used only for generating the PDF and is NOT stored on our servers.</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. How We Use Information</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>To provide login and access</li>
              <li>To improve service experience</li>
              <li>To maintain account security</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Data Security</h2>
            <p className="text-slate-600 mb-4">
              We use secure systems and encryption practices to protect user data. However, no system is 100% secure.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Third-Party Services</h2>
            <p className="text-slate-600 mb-4">
              We may use third-party services like SMS providers (e.g., Fast2SMS) for OTP verification.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Cookies</h2>
            <p className="text-slate-600 mb-4">
              We may use cookies to maintain session and improve user experience.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. User Responsibility</h2>
            <p className="text-slate-600 mb-4">
              Users are responsible for handling applicant data securely after downloading and printing forms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Changes to Policy</h2>
            <p className="text-slate-600 mb-4">
              We may update this policy from time to time. Continued use of PANTRA means you accept the updated policy.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Contact</h2>
            <p className="text-slate-600">For any questions, contact us at: <a href="mailto:support@pantra.in" className="text-blue-600 font-bold">support@pantra.in</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
