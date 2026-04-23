import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Zap, LogOut, Menu } from "lucide-react";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { ContentWrapper } from "@/components/layout/ContentWrapper";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#e9edf1] flex overflow-x-clip">
      {/* Mobile Toggle Checkbox Hack */}
      <input type="checkbox" id="mobile-sidebar-toggle" className="peer hidden" />
      <label htmlFor="mobile-sidebar-toggle" className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0a101d] text-white rounded-xl shadow-lg border border-white/10 cursor-pointer hover:bg-[#1a2333] transition-colors peer-checked:opacity-0 peer-checked:pointer-events-none">
        <Menu className="w-5 h-5" />
      </label>

      {/* Mobile Overlay */}
      <label htmlFor="mobile-sidebar-toggle" className="fixed inset-0 bg-black/60 z-30 opacity-0 pointer-events-none peer-checked:opacity-100 peer-checked:pointer-events-auto transition-opacity md:hidden backdrop-blur-sm cursor-pointer" />

      {/* Sidebar - Fix & Premium Glass */}
      <aside className="w-[220px] glass-sidebar flex flex-col fixed inset-y-0 left-0 z-40 text-white transition-transform duration-300 -translate-x-full peer-checked:translate-x-0 md:translate-x-0 overflow-y-auto sidebar-scroll">
        <div className="pt-8 pb-4 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center -ml-1">
             <Image src="/pantra-logo-transparent.png" alt="PANTRA" width={160} height={45} className="object-contain" style={{ width: "auto" }} priority />
          </Link>
        </div>

        <SidebarNav />

        {/* User Card - Glass Style */}
        <div className="p-4 mt-auto border-t border-white/5 bg-white/5">
          <div className="glass-pill p-3.5 rounded-2xl relative overflow-hidden group flex flex-col">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10 flex flex-col">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Logged in as</div>
              
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <div className="text-[13px] font-bold text-white truncate max-w-[120px]" title={user.name || "Operator"}>
                  {user.name || "Operator"}
                </div>
                <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-widest shrink-0">
                  {user.subscription?.plan_type || 'Free'}
                </div>
              </div>

              <form action="/api/auth/logout" method="POST" className="mt-1 border-t border-white/10 pt-3">
                <button type="submit" className="flex items-center justify-between w-full gap-2 text-slate-400 hover:text-red-400 font-bold transition-all text-xs group/btn">
                  <span>Sign Out</span>
                  <LogOut className="w-3.5 h-3.5 group-hover/btn:-translate-x-0.5 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-[220px] min-h-screen w-full relative flex flex-col transition-all duration-300">
        {/* On mobile, add padding top so hamburger isn't overlapping content */}
        <div className="flex-1 pt-20 md:pt-8 px-4 lg:px-6">
          <ContentWrapper>{children}</ContentWrapper>
        </div>
      </main>
    </div>
  );
}

