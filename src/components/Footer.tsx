import Link from "next/link";
import { Shield, FileCheck, HelpCircle, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0F172A] pt-24 pb-12 border-t border-white/10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-6 group">
              <div className="bg-gradient-to-br from-[#2563EB] to-[#4F46E5] text-white p-2 rounded-xl shadow-lg group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                <Shield className="w-7 h-7" />
              </div>
              <span className="text-3xl font-extrabold text-white tracking-tight">PANTRA</span>
            </Link>
            <p className="text-slate-400 max-w-sm mb-8 leading-relaxed font-medium">
              Professional form-filling toolkit for CSC operators. Generate official PAN application and correction forms in seconds with pixel-perfect accuracy.
            </p>
            <div className="flex flex-wrap items-center gap-6 text-slate-400">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="bg-[#22C55E]/10 p-1.5 rounded-md"><FileCheck className="w-4 h-4 text-[#22C55E]" /></div>
                Official Formats
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <div className="bg-[#2563EB]/10 p-1.5 rounded-md"><Shield className="w-4 h-4 text-[#2563EB]" /></div>
                No Data Stored
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest opacity-80">Platform</h4>
            <ul className="space-y-4">
              <li><Link href="/login" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Start Generating</Link></li>
              <li><Link href="/#pricing" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Pricing Plans</Link></li>
              <li><Link href="/#how-it-works" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">How it Works</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-bold text-white mb-6 uppercase text-xs tracking-widest opacity-80">Legal & Support</h4>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Terms of Service</Link></li>
              <li><Link href="/refund-policy" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Refund Policy</Link></li>
              <li><Link href="/disclaimer" className="text-slate-400 hover:text-white hover:translate-x-1 inline-block transition-all text-sm font-medium">Disclaimer</Link></li>
            </ul>
          </div>
        </div>

        {/* Disclaimer Section */}
        <div className="pt-8 border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-sm p-6 md:p-8 rounded-3xl border border-white/10 mb-10 transition-colors hover:bg-white/10">
            <h5 className="font-bold text-white mb-3 flex items-center gap-2 text-sm uppercase tracking-wider">
              <HelpCircle className="w-5 h-5 text-[#2563EB]" /> Disclaimer
            </h5>
            <p className="text-slate-400 text-sm leading-relaxed">
              PANTRA is an independent tool designed to assist CSC operators in filling official PAN forms. We are not affiliated with NSDL, UTIITSL, or any government authority. Users are responsible for submitting forms through official channels.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-sm font-semibold">
              © {currentYear} PANTRA. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="mailto:support@pantra.in" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-semibold bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:border-white/20">
                <Mail className="w-4 h-4" /> support@pantra.in
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
