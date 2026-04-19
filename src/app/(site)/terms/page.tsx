import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-blue-50 p-3 rounded-2xl">
              <FileText className="w-8 h-8 text-blue-600" />
           </div>
           <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
              <p className="text-slate-500 font-medium">Last updated: April 2026</p>
           </div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            By using PANTRA, you agree to the following terms and conditions.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Service Description</h2>
            <p className="text-slate-600 mb-4">
              PANTRA is a tool designed for CSC / ASK center operators to generate pre-filled PAN form PDFs. We do NOT apply for PAN cards or represent any government authority.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. User Responsibility</h2>
            <p className="text-slate-600 mb-2 font-medium">You agree to:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Provide accurate information</li>
              <li>Use the tool legally</li>
              <li>Submit forms through official government channels</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-red-600">3. Prohibited Use</h2>
            <p className="text-slate-600 mb-2 font-medium">You must NOT:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Use PANTRA for illegal activities</li>
              <li>Misuse applicant data</li>
              <li>Attempt to hack or disrupt the platform</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Account Access</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>You are responsible for maintaining your login credentials.</li>
              <li>Only limited devices are allowed per account.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Service Availability</h2>
            <p className="text-slate-600 mb-4">
              We aim for high uptime but do not guarantee uninterrupted service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">6. Payments</h2>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>All paid plans provide access to form generation features.</li>
              <li>Pricing may change in the future.</li>
            </ul>
          </section>

          <section className="mb-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-slate-600 font-medium mb-4">PANTRA is not responsible for:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Incorrect form submission</li>
              <li>Government rejections</li>
              <li>User data misuse outside the platform</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">8. Termination</h2>
            <p className="text-slate-600 mb-4">
              We may suspend accounts for misuse or violation of terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">9. Changes</h2>
            <p className="text-slate-600 mb-4">
              We may update these terms at any time.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">10. Contact</h2>
            <p className="text-slate-600">For any questions, contact us at: <a href="mailto:support@pantra.in" className="text-blue-600 font-bold">support@pantra.in</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
