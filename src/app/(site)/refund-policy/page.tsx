import { HelpCircle } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="py-24 bg-white">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
           <div className="bg-blue-50 p-3 rounded-2xl">
              <HelpCircle className="w-8 h-8 text-blue-600" />
           </div>
           <div>
              <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Refund Policy</h1>
              <p className="text-slate-500 font-medium">Last updated: April 2026</p>
           </div>
        </div>
        
        <div className="prose prose-slate max-w-none">
          <p className="text-lg text-slate-600 leading-relaxed mb-8">
            This policy outlines the refund conditions for PANTRA subscriptions and individual credits.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">1. Subscription Plans</h2>
            <p className="text-slate-600 mb-4 font-medium">
              All subscription purchases are final and non-refundable.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">2. Pay Per Form</h2>
            <p className="text-slate-600 mb-4">
              Payments made for individual form downloads are non-refundable once the PDF is generated.
            </p>
          </section>

          <section className="mb-12 p-6 bg-slate-50 border border-slate-200 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Exceptions</h2>
            <p className="text-slate-600 mb-4 font-medium">Refunds may be considered only if:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Payment was deducted but service was not delivered.</li>
              <li>Technical error from our side prevented usage.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">4. Refund Requests</h2>
            <p className="text-slate-600 mb-2">To request a refund, contact us within 24 hours of the transaction.</p>
            <p className="text-slate-600 mb-2 font-medium">Include:</p>
            <ul className="list-disc pl-6 text-slate-600 space-y-2">
              <li>Mobile number</li>
              <li>Transaction details</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Processing Time</h2>
            <p className="text-slate-600 mb-4">
              Approved refunds will be processed within 5–7 business days.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-4 text-red-600">6. Abuse Policy</h2>
            <p className="text-slate-600 mb-4">
              Repeated refund requests or misuse may result in account suspension.
            </p>
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
