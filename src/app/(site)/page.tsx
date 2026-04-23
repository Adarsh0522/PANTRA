import Hero from "@/components/Hero";
import Link from "next/link";
import { CheckCircle2, FileText, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Pricing from "@/components/Pricing";

export default function Home() {
  return (
    <>
      <Hero />

      {/* Clarity Section - What PANTRA Does */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-14">
            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] mb-6 font-display tracking-tight leading-tight">
                What PANTRA Does
              </h2>
              <p className="text-lg text-slate-800 mb-8 leading-relaxed font-medium max-w-xl">
                PANTRA is a smart form-filling tool designed for CSC operators. Enter applicant details once, and PANTRA generates a ready-to-print official PAN form PDF.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-slate-800 font-semibold text-base">
                  <div className="bg-[#16A34A]/10 p-1.5 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#16A34A]" /></div>
                  Supports New PAN (Form 93)
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-semibold text-base">
                  <div className="bg-[#16A34A]/10 p-1.5 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#16A34A]" /></div>
                  Supports PAN Correction (CR-01)
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-semibold text-base">
                  <div className="bg-[#16A34A]/10 p-1.5 rounded-full"><CheckCircle2 className="w-5 h-5 text-[#16A34A]" /></div>
                  Auto-aligned fields for perfect printing
                </li>
              </ul>
              {/* Note Box UI Improvement */}
              <div className="mt-8 p-4 bg-blue-50/80 border border-blue-200 rounded-xl max-w-xl shadow-sm">
                <p className="text-sm text-[#1E3A8A] font-semibold leading-relaxed">
                  <span className="font-bold tracking-wide">Note:</span> PANTRA does NOT apply for PAN cards. It only helps generate correctly filled forms.
                </p>
              </div>
            </div>
            {/* Added blue shadow glow for 3D feel */}
            <div className="flex-1 w-full bg-[#0F172A] p-6 lg:p-10 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.15)] relative overflow-hidden group border border-slate-800">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#3B82F6]/20 to-transparent rounded-full -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#1D4ED8]/20 to-transparent rounded-full -ml-16 -mb-16 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative bg-white/10 backdrop-blur-md border border-white/10 p-6 rounded-2xl transform transition-transform duration-300 group-hover:-translate-y-1">
                <FileText className="w-10 h-10 text-white mb-5" />
                <div className="space-y-4">
                  <div className="h-4 w-3/4 bg-slate-400/30 rounded" />
                  <div className="h-4 w-1/2 bg-slate-400/30 rounded" />
                  <div className="h-4 w-2/3 bg-slate-400/30 rounded" />
                </div>
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                  <span className="px-2.5 py-1 bg-white/10 text-white text-[10px] font-bold rounded-md tracking-wider">OFFICIAL FORMAT</span>
                  <span className="px-2.5 py-1 bg-[#16A34A]/20 text-[#22C55E] border border-[#16A34A]/30 text-[10px] font-bold rounded-md tracking-wider">NO DATA STORED</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-[#F8FAFC] border-t border-slate-200">
        <div className="container mx-auto px-4 text-center max-w-5xl">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] mb-14 tracking-tight">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dashed line instead of solid block */}
            <div className="hidden md:block absolute top-[40px] left-[20%] right-[20%] border-t-2 border-dashed border-slate-300 z-0" />

            <div className="relative z-10 group cursor-pointer">
              {/* Solid blue background for numbers */}
              <div className="w-20 h-20 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:-translate-y-2">
                <span className="text-3xl font-black">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Enter Details</h3>
              <p className="text-slate-700 text-base max-w-xs mx-auto font-medium">Fill basic information in a fast, guided digital form.</p>
            </div>
            <div className="relative z-10 group cursor-pointer">
              <div className="w-20 h-20 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:-translate-y-2">
                <span className="text-3xl font-black">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Generate PDF</h3>
              <p className="text-slate-700 text-base max-w-xs mx-auto font-medium">PANTRA automatically maps data into New PAN and Correction PAN official format.</p>
            </div>
            <div className="relative z-10 group cursor-pointer">
              <div className="w-20 h-20 bg-[#2563EB] text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:-translate-y-2">
                <span className="text-3xl font-black">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#0F172A] mb-2">Print & Submit</h3>
              <p className="text-slate-700 text-base max-w-xs mx-auto font-medium">Print the form, attach photo, sign, required documents and submit to authority.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Problem-Solution Section */}
      <section className="py-16 lg:py-24 bg-[#0F172A] text-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-extrabold mb-6 tracking-tight leading-tight text-white">Stop Wasting Time on <br /><span className="text-[#38BDF8]">Manual Forms</span></h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed font-medium">Manual PAN form filling is slow, error-prone, and frustrating. PANTRA helps you handle more customers daily.</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-white/10 rounded-xl border border-white/10">
                  <Zap className="w-8 h-8 text-[#F97316] mb-3" />
                  <h4 className="font-bold text-lg text-white mb-1">Save 20 Min</h4>
                  <p className="text-xs text-slate-300 font-medium">Per application</p>
                </div>
                <div className="p-5 bg-white/10 rounded-xl border border-white/10">
                  <CheckCircle2 className="w-8 h-8 text-[#22C55E] mb-3" />
                  <h4 className="font-bold text-lg text-white mb-1">Zero Errors</h4>
                  <p className="text-xs text-slate-300 font-medium">Perfect alignment</p>
                </div>
              </div>
            </div>

            {/* Added hover effects & Icons instead of dots */}
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-white/5 p-5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 cursor-default">
                <CheckCircle2 className="w-6 h-6 text-[#38BDF8] flex-shrink-0" />
                <span className="font-semibold text-base text-white">Increase your daily earning potential</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 cursor-default">
                <CheckCircle2 className="w-6 h-6 text-[#38BDF8] flex-shrink-0" />
                <span className="font-semibold text-base text-white">Avoid rejection due to handwriting</span>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-5 rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:-translate-y-1 hover:border-white/20 cursor-default">
                <CheckCircle2 className="w-6 h-6 text-[#38BDF8] flex-shrink-0" />
                <span className="font-semibold text-base text-white">Professional pixel-perfect PDFs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Trust Section */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="w-20 h-20 bg-[#16A34A]/10 text-[#16A34A] rounded-2xl flex items-center justify-center mx-auto mb-8">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] mb-5 tracking-tight">Your Data is Safe</h2>
          <p className="text-lg text-slate-800 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
            PANTRA does NOT store applicant data like Aadhaar or PAN details. All data is used only for generating the PDF and is not saved on our servers.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-8 text-base font-bold text-[#0F172A]">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" /> No Aadhaar/PAN stored
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" /> Secure sessions
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#16A34A]" /> Privacy-first design
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 lg:py-20 bg-[#1e293b] text-center px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-6 tracking-tight">Ready to scale your CSC business?</h2>
          <p className="text-lg text-slate-300 mb-10 font-medium">Join thousands of operators saving hours of manual work every day.</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] transition-colors text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:-translate-y-0.5 active:translate-y-0">
            Start Free – No Card Required <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </>
  );
}