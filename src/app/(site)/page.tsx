import Hero from "@/components/Hero";
import Link from "next/link";
import { CheckCircle2, FileText, Zap, ShieldCheck, ArrowRight, IdCard, Wand2, Camera, Crop, PenTool, FileArchive, FileImage, LayoutTemplate, Shield, CreditCard } from "lucide-react";
import Pricing from "@/components/Pricing";
import VideoTutorials from "@/components/VideoTutorials";

export default function Home() {
  return (
    <div className="bg-slate-50 selection:bg-blue-200">
      <Hero />

      {/* MERGED SECTION: What PANTRA Does + How It Works */}
      <section id="how-it-works" className="py-8 lg:py-12 bg-white border-y border-slate-200 overflow-hidden relative z-10 min-h-[calc(100vh-64px)] flex items-center">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Part 1: Text & Video Mockup */}
          <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-12 mb-8 lg:mb-10">

            <div className="flex-1">
              <h2 className="text-3xl lg:text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                What PANTRA Does
              </h2>
              <p className="text-base lg:text-lg text-slate-600 mb-6 leading-relaxed font-medium">
                PANTRA is a smart form-filling tool designed for CSC operators. Enter applicant details once, and PANTRA generates a ready-to-print official PAN form PDF.
              </p>

              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-3 text-slate-800 font-bold text-sm lg:text-base">
                  <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                  Supports New PAN (Form 93)
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-bold text-sm lg:text-base">
                  <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                  Supports PAN Correction (CR-01)
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-bold text-sm lg:text-base">
                  <div className="bg-emerald-100 p-1 rounded-full"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
                  Auto-aligned fields for perfect printing
                </li>
              </ul>

              <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl max-w-lg">
                <p className="text-xs lg:text-sm text-blue-800 font-medium leading-relaxed">
                  <span className="font-bold tracking-wide">Note:</span> PANTRA does NOT apply for PAN cards. It only helps generate correctly filled forms.
                </p>
              </div>
            </div>

            {/* Video Container (Scaled slightly for better fit) */}
            <div className="flex-1 w-full max-w-xl mx-auto bg-slate-900 p-2 rounded-2xl shadow-[0_15px_40px_-10px_rgba(37,99,235,0.2)] relative group border border-slate-800">
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-blue-500/20 to-transparent rounded-full -mr-24 -mt-24 transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-indigo-500/20 to-transparent rounded-full -ml-16 -mb-16 transition-transform duration-700 group-hover:scale-110" />
              <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-2xl transform transition-transform duration-500 group-hover:scale-[1.02] bg-slate-950">
                <video
                  src="/pantra-preview.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Part 2: The 3 Steps (Compact & Stylish) */}
          <div className="pt-8 lg:pt-10 border-t border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative max-w-4xl mx-auto">

              {/* Dashed line connecting steps */}
              <div className="hidden md:block absolute top-[28px] left-[20%] right-[20%] border-t-2 border-dashed border-slate-200 z-0" />

              <div className="relative z-10 group text-center cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:-translate-y-1 border border-blue-400">
                  <span className="text-xl font-black">1</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1.5">Enter Details</h4>
                <p className="text-slate-500 text-sm max-w-[220px] mx-auto font-medium leading-relaxed">Fill basic info in a fast digital form.</p>
              </div>

              <div className="relative z-10 group text-center cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:-translate-y-1 border border-blue-400">
                  <span className="text-xl font-black">2</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1.5">Generate PDF</h4>
                <p className="text-slate-500 text-sm max-w-[220px] mx-auto font-medium leading-relaxed">Auto-maps data into official formats.</p>
              </div>

              <div className="relative z-10 group text-center cursor-pointer">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/20 transition-transform duration-300 group-hover:-translate-y-1 border border-blue-400">
                  <span className="text-xl font-black">3</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1.5">Print & Submit</h4>
                <p className="text-slate-500 text-sm max-w-[220px] mx-auto font-medium leading-relaxed">Print, attach photo, sign & submit.</p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* The Ultimate CSC Toolkit (Center Stage Layout) */}
      <section id="features" className="py-12 lg:py-20 bg-slate-50 overflow-hidden" style={{ backgroundColor: "bisque" }}>
        <div className="container mx-auto px-4 max-w-6xl"> {/* Changed max-w-7xl to max-w-6xl to bring columns closer */}

          {/* Reduced bottom margin from mb-20 to mb-12 */}
          <div className="text-center mb-10 lg:mb-12">
            <h2 className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.2] mb-4">
              Stop Switching Multiple Apps.<br className="hidden md:block" /> Everything Your CSC Center Needs in One Place.
            </h2>
            <p className="text-slate-600 text-base lg:text-lg font-medium max-w-2xl mx-auto">
              Access 7 premium document tools designed specifically for CSC operators. Work faster, securely, and completely in your browser.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-4 items-center">

            {/* Left Column: 4 Tools (Reduced gap from gap-8 to gap-5) */}
            <div className="lg:col-span-4 flex flex-col gap-5 order-2 lg:order-1 relative z-20">
              {/* Tool 1 */}
              <div className="flex items-start gap-4 group justify-start lg:justify-end text-left lg:text-right">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100 group-hover:scale-110 lg:group-hover:-translate-x-1 transition-all duration-300 shadow-sm order-1 lg:order-2">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div className="order-2 lg:order-1">
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">Universal ID Card</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Auto-align Front & Back of Aadhaar/PAN into a print-ready A4 PDF.</p>
                </div>
              </div>

              {/* Tool 2 */}
              <div className="flex items-start gap-4 group justify-start lg:justify-end text-left lg:text-right">
                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100 group-hover:scale-110 lg:group-hover:-translate-x-1 transition-all duration-300 shadow-sm order-1 lg:order-2">
                  <Wand2 className="w-6 h-6" />
                </div>
                <div className="order-2 lg:order-1">
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">AI Background Remover</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Remove backgrounds instantly. Download transparent PNGs securely.</p>
                </div>
              </div>

              {/* Tool 3 */}
              <div className="flex items-start gap-4 group justify-start lg:justify-end text-left lg:text-right">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 lg:group-hover:-translate-x-1 transition-all duration-300 shadow-sm order-1 lg:order-2">
                  <Camera className="w-6 h-6" />
                </div>
                <div className="order-2 lg:order-1">
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">Passport Photo Maker</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Create exact 1:1 ratio, 600x600px photos with custom colors.</p>
                </div>
              </div>

              {/* Tool 4 */}
              <div className="flex items-start gap-4 group justify-start lg:justify-end text-left lg:text-right">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 group-hover:scale-110 lg:group-hover:-translate-x-1 transition-all duration-300 shadow-sm order-1 lg:order-2">
                  <Crop className="w-6 h-6" />
                </div>
                <div className="order-2 lg:order-1">
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">Photo Crop</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Auto-resize to exactly 160x200px and strictly compress under 20KB.</p>
                </div>
              </div>
            </div>

            {/* Center Column: Video Mockup */}
            <div className="lg:col-span-4 relative w-full max-w-md mx-auto order-1 lg:order-2 z-10 my-4 lg:my-0">
              <div className="relative rounded-3xl bg-white border border-slate-300 shadow-[0_30px_70px_-15px_rgba(0,0,0,0.15)] p-2 group transition-all duration-300 hover:shadow-[0_40px_80px_-10px_rgba(0,0,0,0.2)]">
                {/* Subtle Outer Glow */}
                <div className="absolute inset-0 bg-blue-100/50 blur-[40px] -z-10 rounded-full scale-[1.02] group-hover:bg-blue-100/70 transition-all duration-500" />

                {/* Browser UI Top Bar */}
                <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 mb-2 bg-slate-50 rounded-t-2xl">
                  <div className="w-3 h-3 rounded-full bg-red-400 border border-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400 border border-amber-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400 border border-emerald-500/50"></div>
                </div>

                {/* Video Container */}
                <div className="relative w-full aspect-[4/5] lg:aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] border border-slate-200">
                  <video
                    src="/pantra-preview.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: 3 Tools (Reduced gap from gap-8 to gap-5) */}
            <div className="lg:col-span-4 flex flex-col gap-5 order-3 lg:order-3 relative z-20">
              {/* Tool 5 */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 border border-orange-100 group-hover:scale-110 lg:group-hover:translate-x-1 transition-all duration-300 shadow-sm">
                  <PenTool className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">Signature Crop</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Auto-resize to exactly 256x64px and strictly compress under 20KB.</p>
                </div>
              </div>

              {/* Tool 6 */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center shrink-0 border border-teal-100 group-hover:scale-110 lg:group-hover:translate-x-1 transition-all duration-300 shadow-sm">
                  <FileArchive className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">Smart PDF Compressor</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Compress any ID proof or document strictly under 100KB automatically.</p>
                </div>
              </div>

              {/* Tool 7 */}
              <div className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100 group-hover:scale-110 lg:group-hover:translate-x-1 transition-all duration-300 shadow-sm">
                  <FileImage className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-slate-900 font-bold text-lg mb-0.5 tracking-tight">PDF to Image Converter</h4>
                  <p className="text-slate-500 text-sm leading-snug font-medium">Extract high-quality JPGs from encrypted or standard PDF pages.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Pricing />

      {/* Trust Section */}
      <section className="py-12 bg-white" style={{ backgroundColor: "bisque" }}>
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-sm border border-emerald-100/50">
            <Shield className="w-10 h-10" />
          </div>
          <h2 className="text-3xl lg:text-5xl font-black text-slate-900 mb-6 tracking-tight">100% Secure & Private</h2>
          <p className="text-lg lg:text-xl text-slate-500 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            PANTRA does NOT store applicant data. All document tools run locally in your browser. Your clients' Aadhaar and PAN details never leave your device.
          </p>
          <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 text-base font-bold text-slate-700 bg-slate-50 py-6 rounded-3xl border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              No Data Stored
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              Client-Side Processing
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5 text-emerald-600" /></div>
              Privacy-First
            </div>
          </div>
        </div>
      </section>

      <VideoTutorials />

      {/* Final CTA */}
      <section className="py-12 bg-slate-900 text-center px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl lg:text-6xl font-black text-white mb-6 tracking-tight">Ready to scale your CSC business?</h2>
          <p className="text-xl text-slate-400 mb-10 font-medium">Join thousands of operators saving hours of manual work every day.</p>
          <Link href="/login" className="inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 transition-all text-white px-10 py-5 rounded-2xl font-bold text-xl shadow-[0_0_40px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_-10px_rgba(37,99,235,0.6)] hover:-translate-y-1">
            Start Free Today <ArrowRight className="w-6 h-6" />
          </Link>
          <p className="mt-6 text-slate-500 font-medium">No credit card required. 1 Free trial per tool included.</p>
        </div>
      </section>
    </div>
  );
}