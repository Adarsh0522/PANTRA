import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { download_logs, pan_forms } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { formatDate, addDays, isAfter } from "date-fns";
import { FilePlus, FileEdit, Clock, CheckCircle2, ChevronLeft, ChevronRight, Wrench, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { getPlan, type PlanKey } from "@/lib/plans-db";

interface PageProps {
  searchParams?: Promise<any> | any;
}

export default async function ActivityPage(props: PageProps) {
  const searchParams = await props.searchParams;
  const user = await getCurrentUser();
  if (!user) return null;

  const page = parseInt((searchParams?.page as string) || "1", 10);
  const tab = (searchParams?.tab as string) || "pan";

  // Set page size activity list
  const pageSize = 10;

  // Fetch all downloads for lifetime history
  const allDownloads = await db
    .select({
      id: download_logs.id,
      downloaded_at: download_logs.downloaded_at,
      form_type: pan_forms.form_type,
      data: pan_forms.data,
    })
    .from(download_logs)
    .leftJoin(pan_forms, eq(download_logs.pan_form_id, pan_forms.id))
    .where(eq(download_logs.user_id, user.id))
    .orderBy(desc(download_logs.downloaded_at));

  const lifetimeCount = allDownloads.length;

  // 🔥 FIX 2: Paginate using allDownloads instead of currentCycleDownloads
  // This ensures Pay Per Form records are visible even if they fall outside the current cycle
  const totalPages = Math.ceil(lifetimeCount / pageSize);
  const paginatedDownloads = allDownloads.slice((page - 1) * pageSize, page * pageSize);

  // Cycle calculation for the header stats (keep it for info)
  const subStartDate = user.subscription?.start_date ? new Date(user.subscription.start_date) : new Date();
  const currentCycleStart = new Date();
  currentCycleStart.setDate(subStartDate.getDate());
  currentCycleStart.setHours(0, 0, 0, 0);
  if (currentCycleStart > new Date()) currentCycleStart.setMonth(currentCycleStart.getMonth() - 1);
  const monthlyCount = allDownloads.filter(log => log.downloaded_at >= currentCycleStart).length;

  // Tools Validity Logic
  const planKey = (user.subscription?.plan_type as string) || 'free';
  const isFree = planKey === 'free';
  const plan = await getPlan(planKey as PlanKey);
  const toolsValidityDays = plan?.toolsValidityDays || 0;

  const toolsValidUntil = user.subscription?.tools_active_until 
    ? new Date(user.subscription.tools_active_until)
    : (user.subscription?.start_date && toolsValidityDays > 0 
        ? addDays(new Date(user.subscription.start_date), toolsValidityDays) 
        : null);
    
  const toolsActive = toolsValidUntil ? isAfter(toolsValidUntil, new Date()) : false;

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Activity</h1>
          <p className="text-slate-500 mt-1 font-medium">View your complete usage and generation history.</p>
        </div>

        <div className="flex gap-4">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100/60 rounded-2xl p-4 shadow-sm min-w-[160px]">
            <p className="text-indigo-500 text-[10px] font-bold uppercase tracking-widest mb-1">Lifetime Generations</p>
            <div className="text-2xl font-black text-indigo-900 tracking-tight">{lifetimeCount}</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100/60 rounded-2xl p-4 shadow-sm min-w-[160px]">
            <p className="text-emerald-500 text-[10px] font-bold uppercase tracking-widest mb-1">Current Cycle</p>
            <div className="text-2xl font-black text-emerald-900 tracking-tight">{monthlyCount}</div>
          </div>
        </div>
      </div>

      {/* TABS COMPONENT */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <Link
          href="/dashboard/activity?tab=pan"
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${tab === 'pan' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          PAN Generation History
        </Link>
        <Link
          href="/dashboard/activity?tab=tools"
          className={`pb-3 px-2 text-sm font-bold border-b-2 transition-colors ${tab === 'tools' ? 'border-purple-600 text-purple-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Premium Tools Usage
        </Link>
      </div>

      {tab === 'pan' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden text-sm">
          <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-bold text-slate-800 text-lg">PAN Forms Generated</h3>
          </div>

        {paginatedDownloads.length > 0 ? (
          <>
            <div className="divide-y divide-slate-100">
              {paginatedDownloads.map((log) => {
                const payload = (log.data || {}) as Record<string, any>;
                let displayName = "Unknown User";
                if (payload.first_name) {
                  displayName = [payload.first_name, payload.middle_name, payload.last_name].filter(Boolean).join(' ');
                } else if (payload.firstName) {
                  displayName = [payload.firstName, payload.middleName, payload.lastName].filter(Boolean).join(' ');
                } else if (payload.applicant_name) {
                  displayName = payload.applicant_name;
                }

                return (
                  <div key={log.id} className="p-4 px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner font-bold text-lg shrink-0 ${log.form_type === 'new' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {log.form_type === 'new' ? <FilePlus className="w-5 h-5" /> : <FileEdit className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base">{displayName || 'Form Submission'}</p>
                        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 mt-0.5">
                          <span className="capitalize">{log.form_type} PAN</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Downloaded
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left sm:text-right text-slate-500 text-xs font-medium bg-slate-50 sm:bg-transparent p-2 sm:p-0 rounded-lg sm:rounded-none">
                      {formatDate(new Date(log.downloaded_at), 'dd MMM yyyy')}
                      <div className="text-[11px] mt-0.5 opacity-80">{formatDate(new Date(log.downloaded_at), 'hh:mm a')}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50">
                <span className="text-sm font-medium text-slate-500">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, lifetimeCount)} of {lifetimeCount} entries
                </span>
                <div className="flex items-center gap-2">
                  {page > 1 ? (
                    <Link href={`/dashboard/activity?page=${page - 1}`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
                      <ChevronLeft className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg opacity-50 cursor-not-allowed text-slate-400">
                      <ChevronLeft className="w-4 h-4" />
                    </div>
                  )}

                  <span className="text-sm font-bold text-slate-700 px-2">
                    Page {page} of {totalPages}
                  </span>

                  {page < totalPages ? (
                    <Link href={`/dashboard/activity?page=${page + 1}`} className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-600">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <div className="p-2 bg-slate-100 border border-slate-200 rounded-lg opacity-50 cursor-not-allowed text-slate-400">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="h-[300px] flex flex-col items-center justify-center p-8 text-center bg-slate-50/30">
            <div className="w-16 h-16 bg-blue-50 text-blue-200 rounded-full flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-blue-400" />
            </div>
            <p className="text-slate-800 font-bold mb-1">No activity yet</p>
            <p className="text-slate-500 text-sm font-medium max-w-sm">
              Your generated and downloaded PAN forms will appear here.
            </p>
          </div>
        )}
      </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-8 md:p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-purple-50/50">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Privacy First Processing</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto mb-8">
            Client-side tool usage is not individually logged to protect your privacy. Your files never leave your browser, so we only track your overarching Tools Validity.
          </p>
          
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 w-full max-w-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Wrench className="w-4 h-4 text-purple-500" /> Premium Tools
              </span>
              {isFree ? (
                <span className="text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                  Free Tier
                </span>
              ) : toolsActive ? (
                <span className="text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Active
                </span>
              ) : (
                <span className="text-xs font-black uppercase tracking-wider bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1">
                  Expired
                </span>
              )}
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className={`h-full rounded-full w-full ${isFree ? 'bg-slate-400' : toolsActive ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
            </div>
            <p className="text-xs text-slate-500 mt-3 font-medium text-left">
              {isFree ? "Upgrade to unlock unlimited tools." : toolsActive ? "Your unlimited tools access is active and ready to use." : "Your tools access has expired. Please renew."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}