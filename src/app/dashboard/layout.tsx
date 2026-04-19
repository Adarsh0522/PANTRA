import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Zap, LogOut } from "lucide-react";
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
    <div className="min-h-screen bg-[#e9edf1] flex overflow-x-hidden">
      {/* Sidebar - Fix & Premium Glass */}
      <aside className="w-[220px] glass-sidebar flex flex-col fixed inset-y-0 z-20 text-white">
        <div className="h-20 flex items-center px-6">
          <Link href="/dashboard" className="flex items-center -ml-1">
             <Image src="/pantra-logo-transparent.png" alt="PANTRA" width={160} height={45} className="object-contain" style={{ width: "auto" }} priority />
          </Link>
        </div>

        <SidebarNav />

        {/* User Card - Glass Style */}
        <div className="p-4 mt-auto border-t border-white/5 bg-white/2">
          <div className="glass-pill p-3.5 rounded-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1.5">Logged in as</div>
              <div className="text-[14px] font-bold text-white mb-2 font-mono">
                {user.mobile_number}
              </div>
              <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 text-[9px] font-black text-primary uppercase tracking-widest">
                {user.subscription?.plan_type || 'Free'}
              </div>
            </div>
          </div>

          <form action="/api/auth/logout" method="POST" className="mt-4">
            <button type="submit" className="flex items-center w-full gap-3 px-3 py-2 text-slate-400 hover:text-red-400 rounded-xl font-bold transition-all text-xs group">
              <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[220px] min-h-screen relative flex flex-col">
        {/* Everything starts from top, no top header */}
        <div className="flex-1 pt-8 px-4 lg:px-6">
          <ContentWrapper>{children}</ContentWrapper>
        </div>
      </main>
    </div>


  );
}

