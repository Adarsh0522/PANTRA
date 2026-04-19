"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FilePlus, Clock, ShieldCheck, CreditCard, LucideIcon, UserCog } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-[13px] transition-all relative group",
        isActive
          ? "bg-primary/10 text-white shadow-[0_0_20px_rgba(37,99,235,0.15)]"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      )}
    >
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-right shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
      )}
      <Icon className={cn("w-4.5 h-4.5 transition-colors", isActive ? "text-primary" : "text-slate-500 group-hover:text-slate-300")} />
      <span>{label}</span>
    </Link>
  );
}

export function SidebarNav() {
  return (
    <nav className="flex-1 py-6 px-3 space-y-1">
      <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
      
      <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Applications</div>
      <NavItem href="/dashboard/new-pan" icon={FilePlus} label="New PAN Form" />
      <NavItem href="/dashboard/correction-pan" icon={Clock} label="PAN Correction" />
      
      <div className="pt-6 pb-2 px-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Account</div>
      <NavItem href="/dashboard/profile" icon={UserCog} label="Profile Setup" />
      <NavItem href="/dashboard/pricing" icon={CreditCard} label="Pricing" />
      <NavItem href="/dashboard/subscription" icon={ShieldCheck} label="Subscriptions" />
    </nav>
  );
}


