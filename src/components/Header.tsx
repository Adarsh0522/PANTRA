"use client";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Zap, Award, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-2 md:top-2 left-0 right-0 z-50 px-4 w-full">
      <div
        className={`max-w-6xl mx-auto rounded-full transition-all duration-300 ${isScrolled
          ? "bg-[#0B1121]/80 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
          : "bg-white/5 backdrop-blur-md border border-white/10 shadow-lg"
          }`}
      >
        <div className="flex items-center justify-between px-6 py-3">

          {/* Left Section (Logo) */}
          <Link href="/" className="flex items-center">
            <Image src="/pantra-logo-transparent.png" alt="PANTRA" width={160} height={45} className="object-contain" style={{ width: "auto" }} priority />
          </Link>

          {/* Middle Section (Navigation) */}
          <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How to work</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Right Section (Trust Badges & Button) */}
          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold tracking-widest shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SECURE
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold tracking-widest shadow-inner">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> FAST
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold tracking-widest shadow-inner">
                <Award className="w-3.5 h-3.5 text-blue-400" /> TRUSTED
              </div>
            </div>

            <Link
              href="/login"
              className="hidden lg:flex text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-7 py-2.5 rounded-full transition-all shadow-md shadow-[#2563EB]/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              Login
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden text-white p-1 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[calc(100%+16px)] left-4 right-4 bg-[#0B1121]/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 origin-top animate-in fade-in zoom-in-95 duration-200">
          <nav className="flex flex-col gap-5 text-base font-semibold text-slate-300">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">How to work</Link>
            <Link href="#pricing" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#contact" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Contact</Link>
          </nav>

          <div className="h-px bg-white/10 w-full" />

          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            className="text-center font-bold bg-[#2563EB] text-white py-3.5 rounded-xl shadow-md w-full"
          >
            Login
          </Link>
        </div>
      )}
    </header>
  );
}
