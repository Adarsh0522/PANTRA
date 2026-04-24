import Link from "next/link";
import { ArrowRight, FileText, CheckCircle2 } from "lucide-react";

export default function Hero() {
  return (
    // varun padding wadhawli (pt-16 lg:pt-20) ani khalun kami keli (pb-8 lg:pb-10)
    <section className="relative bg-[#0B1121] pt-16 pb-8 lg:pt-30 lg:pb-10 overflow-hidden border-b border-white/5">
      {/* Dynamic Colored Background Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] lg:w-[1000px] lg:h-[1000px] bg-gradient-to-bl from-[#2563EB]/25 via-[#4F46E5]/15 to-transparent rounded-full blur-[100px] pointer-events-none -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-[#16A34A]/15 to-transparent rounded-full blur-[100px] pointer-events-none translate-y-1/2 -translate-x-1/3" />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      <div className="container relative mx-auto px-4 z-10 max-w-5xl">
        <div className="flex flex-col items-center justify-center">

          {/* Centered Content */}
          <div className="w-full text-center">

            {/* mb-8 cha mb-4 kela ahe */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1E293B]/60 border border-white/10 text-slate-300 font-semibold text-xs mb-4 transition-all hover:bg-[#1E293B] tracking-wide shadow-lg backdrop-blur-md mx-auto">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#38BDF8] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#38BDF8]"></span>
              </span>
              Built for CSC & ASK Center Operators
            </div>

            {/* mb-6 cha mb-4 kela ahe */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.15] mb-4 mx-auto">
              Generate PAN Forms <br className="hidden sm:block" />
              in{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] to-[#818CF8] whitespace-nowrap">
                2 Minutes
              </span>
            </h1>

            {/* mb-10 cha mb-6 kela ahe */}
            <p className="text-lg lg:text-xl text-slate-400 max-w-4xl mx-auto leading-relaxed font-medium mb-6">
              Fill New PAN (93) and PAN Correction (CR-01) instantly with pixel-perfect PDF output — ready for print and submission.
            </p>

            {/* mb-12 cha mb-8 kela ahe */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 w-full max-w-md mx-auto">
              <Link
                href="/login"
                className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5"
              >
                Start Free <ArrowRight className="w-5 h-5" />
              </Link>
              <button className="flex w-full sm:w-auto flex-1 items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white border border-white/15 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5">
                <FileText className="w-5 h-5 text-slate-300" /> Watch Demo
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-300 font-semibold bg-[#0F172A]/50 py-3 px-6 rounded-2xl w-fit mx-auto border border-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> Official Format
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#38BDF8]" /> No Data Stored
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/10"></div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E]" /> Fast PDF
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}