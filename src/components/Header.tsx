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
      setIsScrolled(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? "bg-[#0B1121]/90 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
          : "bg-[#0B1121] border-b border-transparent"
        }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16"> {/* Fixed height to keep it compact */}

          {/* Left Section (Logo) */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/pantra-logo-transparent.png"
              alt="PANTRA"
              width={140}
              height={40}
              className="object-contain"
              style={{ width: "auto", height: "auto" }}
              priority
            />
          </Link>

          {/* Middle Section (Navigation) */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#contact" className="hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Right Section (Trust Badges & Button) */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold tracking-widest shadow-inner">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SECURE
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold tracking-widest shadow-inner">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> FAST
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 text-[10px] font-bold tracking-widest shadow-inner">
                <Award className="w-3.5 h-3.5 text-blue-400" /> TRUSTED
              </div>
            </div>

            <Link
              href="/login"
              className="hidden md:flex text-sm font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white px-6 py-2 rounded-full transition-all shadow-md hover:-translate-y-0.5 active:translate-y-0"
            >
              Login
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden text-white p-1 hover:bg-white/10 rounded-full transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0B1121]/95 backdrop-blur-xl border-b border-white/10 p-6 shadow-2xl flex flex-col gap-6 origin-top animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-5 text-base font-semibold text-slate-300">
            <Link href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="hover:text-white transition-colors">How it works</Link>
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