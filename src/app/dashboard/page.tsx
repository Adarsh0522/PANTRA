import { getCurrentUser } from "@/lib/auth";
import { getTodayDownloadCount } from "@/lib/download-guard";
import { PLANS } from "@/lib/plans";
import Link from "next/link";
import { FilePlus, Clock, Search, Zap, AlertTriangle, Play, CheckCircle2, MessageCircle, HelpCircle, ArrowRight, CreditCard, FileEdit } from "lucide-react";
import { db } from "@/db";
import { pan_forms, generated_pdfs } from "@/db/schema";
import { eq, desc, and, count, gte } from "drizzle-orm";
import { formatDate } from "date-fns";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Real Stats from DB
  const todayDownloads = await getTodayDownloadCount(user.id);
  const planKey = (user.subscription?.plan_type as any) || 'free';
  const plan = PLANS[planKey as keyof typeof PLANS] || PLANS.free;

  const isFree = planKey === 'free';
  const sub = user.subscription;

  // Usage tracking
  const freeDownloadsUsed = sub?.free_downloads_today || 0;
  const paidDownloadsUsed = sub?.downloads_used || 0;
  const downloadLimit = sub?.download_limit || 2;
  const remainingFree = Math.max(0, 2 - freeDownloadsUsed);
  const remainingPaid = downloadLimit === 999999 ? 'Unlimited' : Math.max(0, downloadLimit - paidDownloadsUsed);

  // Expiry Warning Logic
  const isPaid = planKey !== 'free' && sub?.end_date;
  let daysUntilExpiry: number | null = null;
  if (isPaid && sub?.end_date) {
    const diff = new Date(sub.end_date).getTime() - new Date().getTime();
    daysUntilExpiry = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry <= 2 && daysUntilExpiry >= 0;

  // Database Queries
  const resumeForm = await db.query.pan_forms.findFirst({
    where: and(eq(pan_forms.user_id, user.id), eq(pan_forms.status, 'draft')),
    orderBy: [desc(pan_forms.created_at)],
  });

  const totalPdfsResult = await db.select({ count: count() })
    .from(generated_pdfs)
    .innerJoin(pan_forms, eq(generated_pdfs.pan_form_id, pan_forms.id))
    .where(eq(pan_forms.user_id, user.id));
  const lifetimePdfs = totalPdfsResult[0]?.count || 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyPdfsResult = await db.select({ count: count() })
    .from(generated_pdfs)
    .innerJoin(pan_forms, eq(generated_pdfs.pan_form_id, pan_forms.id))
    .where(and(eq(pan_forms.user_id, user.id), gte(generated_pdfs.created_at, startOfMonth)));
  const monthlyPdfs = monthlyPdfsResult[0]?.count || 0;

  const recentForms = await db.query.pan_forms.findMany({
    where: eq(pan_forms.user_id, user.id),
    orderBy: [desc(pan_forms.created_at)],
    limit: 5,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">

      {/* 1. TOP BANNER (DYNAMIC & EXPIRY) */}
      {isExpiringSoon ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-red-500 w-6 h-6" />
            <p className="text-red-800 font-medium">
              Your plan expires in {daysUntilExpiry === 0 ? "today" : `${daysUntilExpiry} days`}. Upgrade now to avoid interruption.
            </p>
          </div>
          <Link href="/dashboard/pricing" className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-red-700 transition-colors whitespace-nowrap">
            Renew Now
          </Link>
        </div>
      ) : isFree ? (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-500/20 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="flex items-center gap-5 relative z-10">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md ring-4 ring-white/10 group-hover:scale-110 smooth-transition">
              <Zap className="w-7 h-7 fill-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">You're on the Free Plan</h2>
              <p className="text-blue-100/80 text-sm font-medium">Get unlimited downloads, zero watermarks, and fast generation.</p>
            </div>
          </div>
          <Link
            href="/dashboard/pricing"
            className="whitespace-nowrap px-8 py-3 bg-white text-blue-600 font-black text-sm rounded-2xl hover:bg-white/90 smooth-transition shadow-lg shadow-black/10 relative z-10"
          >
            Upgrade Now
          </Link>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        </div>
      ) : (
        <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative group">
          <div className="flex items-center gap-5 relative z-10">
            <div className="flex flex-col">
              <h2 className="text-lg font-bold tracking-tight text-emerald-400 capitalize flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5" />
                {planKey} Plan Active
              </h2>
              <p className="text-slate-400 text-sm font-medium">Expire in {daysUntilExpiry !== null ? daysUntilExpiry : '∞'} days • {remainingPaid} downloads remaining</p>
            </div>
          </div>
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none" />
        </div>
      )}

      {/* 2. MAIN ACTIONS */}
      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
        Quick Actions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/dashboard/new-pan" className="bg-white shadow-sm border border-slate-200 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 rounded-2xl p-6 smooth-transition group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-100 transition-colors" />
          <div className="relative">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-500/30 smooth-transition ring-4 ring-white">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">New PAN Application</h3>
            <p className="text-slate-500 text-sm mt-1">Start Form No.93 generation</p>
          </div>
        </Link>

        <Link href="/dashboard/correction-pan" className="bg-white shadow-sm border border-slate-200 hover:border-amber-500 hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1 rounded-2xl p-6 smooth-transition group flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-amber-100 transition-colors" />
          <div className="relative">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-amber-500/30 smooth-transition ring-4 ring-white">
              <FileEdit className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">PAN Correction</h3>
            <p className="text-slate-500 text-sm mt-1">Update existing PAN details</p>
          </div>
        </Link>

        {resumeForm ? (
          <Link href={`/dashboard/${resumeForm.form_type}-pan`} className="bg-gradient-to-br from-indigo-500 to-indigo-700 border border-indigo-400 hover:from-indigo-600 hover:to-indigo-800 hover:shadow-xl hover:shadow-indigo-500/30 rounded-2xl p-6 smooth-transition group flex flex-col justify-between text-white relative overflow-hidden">
            <div className="w-12 h-12 bg-white/20 text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 smooth-transition relative z-10 backdrop-blur-md shadow-inner">
              <Play className="w-6 h-6 ml-0.5 fill-white" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold text-white">Resume Application</h3>
              <p className="text-indigo-100 text-sm mt-1 line-clamp-1 opacity-90">
                Continue your last draft
              </p>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 smooth-transition" />
          </Link>
        ) : (
          <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 border-dashed rounded-2xl p-6 flex flex-col justify-center items-center text-center text-slate-400 shadow-inner">
            <Search className="w-8 h-8 mb-2 opacity-50 text-slate-300" />
            <p className="text-sm font-medium">No drafts available</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

        {/* LEFT COLUMN: Insights & Info */}
        <div className="md:col-span-5 flex flex-col gap-6">

          {/* 3. USAGE CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest mb-4">Current Usage</h3>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {isFree ? `${freeDownloadsUsed} / 2` : `${paidDownloadsUsed} / ${downloadLimit === 999999 ? '∞' : downloadLimit}`}
            </div>
            <p className="text-slate-500 text-sm font-medium mb-4 mt-1">
              {isFree ? "Downloads Used Today" : "Downloads Used"}
            </p>

            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(100, isFree ? (freeDownloadsUsed / 2) * 100 : (downloadLimit === 999999 ? 10 : (paidDownloadsUsed / downloadLimit) * 100))}%` }}
              />
            </div>
            {isFree && <p className="text-xs font-semibold text-slate-400 text-right mt-2">{remainingFree} remaining today</p>}
          </div>

          {/* 4. ACCOUNT INFO CARD */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-500 rounded-2xl p-6 shadow-lg shadow-blue-500/20 flex flex-col justify-between text-white relative overflow-hidden">
            <div className="relative z-10 flex items-start justify-between w-full h-full">
              <div>
                <h3 className="font-bold text-blue-200 text-xs uppercase tracking-widest mb-1">Account Info</h3>
                <div className="text-2xl font-black capitalize flex items-center gap-2 mt-2">
                  {planKey} Plan
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-black tracking-wider uppercase ${isFree ? 'bg-white/20 text-white' : 'bg-emerald-400/20 text-emerald-300'}`}>
                    {isFree ? 'Free' : 'Active'}
                  </span>
                </div>
                <div className="text-sm font-medium text-blue-200 mt-2">
                  {isPaid ? `Expires on ${sub?.end_date ? formatDate(new Date(sub.end_date), 'dd MMM yyyy') : '-'}` : 'Lifetime validity'}
                </div>
              </div>
              <Link href="/dashboard/subscription" className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors backdrop-blur-sm border border-white/10 mt-1">
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* decorative circle */}
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* 5. QUICK STATS */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60 rounded-2xl p-5 shadow-sm">
              <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-1">Total PDFs</p>
              <div className="text-3xl font-black text-indigo-900 tracking-tight">{lifetimePdfs}</div>
              <p className="text-indigo-600/70 text-xs font-semibold mt-1">Lifetime generated</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-2xl p-5 shadow-sm">
              <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1">Monthly</p>
              <div className="text-3xl font-black text-emerald-900 tracking-tight">{monthlyPdfs}</div>
              <p className="text-emerald-600/70 text-xs font-semibold mt-1">Generated this month</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recent Activity & Support */}
        <div className="md:col-span-7 flex flex-col gap-6">

          {/* 6. RECENT ACTIVITY */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-800">Recent Activity</h3>
            </div>

            <div className="flex-1">
              {recentForms.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {recentForms.map((form) => {
                    // Safely grab name, assuming it could be stored differently
                    const payload = form.data as Record<string, any>;
                    let displayName = "Unknown User";
                    if (payload.first_name) {
                      displayName = [payload.first_name, payload.middle_name, payload.last_name].filter(Boolean).join(' ');
                    } else if (payload.applicant_name) {
                      displayName = payload.applicant_name;
                    } else if (payload.name) {
                      displayName = payload.name;
                    }

                    return (
                      <div key={form.id} className="p-4 px-6 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${form.form_type === 'new' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                            {form.form_type === 'new' ? 'N' : 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm">{displayName || 'Form Submission'}</p>
                            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                              <span className="capitalize">{form.form_type} PAN</span>
                              <span>•</span>
                              <span>{formatDate(new Date(form.created_at), 'dd MMM yyyy, hh:mm a')}</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/dashboard/${form.form_type}-pan`} className="opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                          Resume
                        </Link>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
                  <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
                    <FilePlus className="w-8 h-8 text-blue-400" />
                  </div>
                  <p className="text-slate-800 font-bold mb-1">Start your first PAN application</p>
                  <p className="text-slate-500 text-sm font-medium mb-6 max-w-sm">
                    Generate your first structurally perfect, high-precision form directly from your browser.
                  </p>
                  <Link href="/dashboard/new-pan" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-lg shadow-blue-500/20 transition-all">
                    Start Processing
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* 9. SUPPORT */}
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold">Need Help or Consultation?</h3>
                <p className="text-slate-400 text-sm font-medium">Reach out for business or technical assistance.</p>
              </div>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <a href="https://wa.me/919999999999" target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] px-5 py-2.5 rounded-xl font-bold text-sm transition-colors border border-[#25D366]/20">
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
