import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-red-50 p-3 rounded-2xl">
              <AlertTriangle className="w-8 h-8 text-red-600" />
           </div>
           <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Disclaimer</h1>
              <p className="text-slate-500 font-medium">Last updated: April 2026</p>
           </div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-xl font-bold text-slate-900 leading-relaxed mb-8">
            PANTRA is an independent software tool designed for CSC operators.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Independent Tool</h2>
            <p className="text-slate-600 mb-4 font-medium">We are NOT affiliated with:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>NSDL</li>
              <li>UTIITSL</li>
              <li>Income Tax Department</li>
              <li>Any Government authority</li>
            </ul>
          </section>

          <section className="mb-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
            <h2 className="text-2xl font-bold text-blue-900 mb-4">2. No PAN Application Service</h2>
            <p className="text-blue-800 font-medium mb-4">
              PANTRA does NOT apply for PAN cards. We only generate pre-filled PDF forms based on user input.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Official Forms</h2>
            <p className="text-slate-600 mb-4">We use publicly available government formats such as:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2 font-medium">
              <li>New PAN Form (Form 93)</li>
              <li>PAN Correction Form (CR-01)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-emerald-600">4. User Responsibility</h2>
            <p className="text-slate-600 mb-4 font-medium">Users are fully responsible for:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Verifying data before printing</li>
              <li>Collecting documents</li>
              <li>Submitting forms through official channels</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Accuracy</h2>
            <p className="text-slate-600 mb-4">While we aim for high accuracy, we do not guarantee:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Acceptance of forms by authorities</li>
              <li>Error-free submissions</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-red-600">6. Liability</h2>
            <p className="text-slate-600 mb-4 font-medium">PANTRA is not liable for:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Rejected applications</li>
              <li>Incorrect user input</li>
              <li>External processing delays</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">7. Contact</h2>
            <p className="text-slate-600">For any questions, contact us at: <a href="mailto:support@pantra.in" className="text-blue-600 font-bold">support@pantra.in</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
