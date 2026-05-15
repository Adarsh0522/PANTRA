import { getCurrentUser } from "@/lib/auth";
import { CheckCircle2, AlertTriangle, Crown, Download, Check, XCircle } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { payments, download_logs, pan_forms, subscriptions } from "@/db/schema";
import { eq, desc, count } from "drizzle-orm";
import { formatDate, addDays, isAfter } from "date-fns";
import { Wrench } from "lucide-react";
import { getPlan, type PlanKey } from "@/lib/plans-db";

export default async function SubscriptionPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const currentPlan = user.subscription?.plan_type || 'free';
  const sub = user.subscription;
  const isFree = currentPlan === 'free';

  // Usage tracking — simple lifetime credits
  const downloadsUsed = sub?.downloads_used || 0;
  const downloadLimit = sub?.download_limit || 5;
  const remainingDownloads = Math.max(0, downloadLimit - downloadsUsed);

  // 1. Fetch total PDFs generated
  const totalPdfsResult = await db.select({ count: count() })
    .from(download_logs)
    .where(eq(download_logs.user_id, user.id));
  const totalPdfs = totalPdfsResult[0]?.count || 0;

  // 2. Fetch last 5 transactions
  const txns = await db.query.payments.findMany({
    where: eq(payments.user_id, user.id),
    orderBy: [desc(payments.created_at)],
    limit: 5,
  });

  // Format purchase date
  const purchasedOn = sub?.start_date ? formatDate(new Date(sub.start_date), 'dd MMMM yyyy') : '-';

  // Tools Validity Logic
  const plan = await getPlan(currentPlan as PlanKey);
  const toolsValidityDays = plan?.toolsValidityDays || 0;

  const toolsValidUntil = sub?.tools_active_until
    ? new Date(sub.tools_active_until)
    : (sub?.start_date && toolsValidityDays > 0
      ? addDays(new Date(sub.start_date), toolsValidityDays)
      : null);

  const toolsActive = toolsValidUntil ? isAfter(toolsValidUntil, new Date()) : false;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Subscription & Billing</h1>
        <p className="text-slate-500 mt-1 font-medium">Manage your active plan, usage, and billing history.</p>
      </div>

      {/* 1. CURRENT PLAN SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row gap-0">
        <div className="p-8 flex-1">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 shadow-sm-none">Current Plan</div>
          <div className="text-4xl font-black text-slate-900 capitalize flex items-center gap-3 tracking-tight">
            {currentPlan} Plan
            {!isFree && (
              <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-6">
            {!isFree ? (
              <>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Purchased On</div>
                  <div className="text-sm font-bold text-slate-800">{purchasedOn}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Validity</div>
                  <div className="text-sm font-bold text-emerald-600">No Expiry (Lifetime)</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-semibold mb-1">Downloads Remaining</div>
                  <div className="text-sm font-bold text-slate-800">{remainingDownloads} of {downloadLimit}</div>
                </div>
              </>
            ) : (
              <div className="text-sm font-bold text-slate-700 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                You are on Free Plan ({remainingDownloads} of {downloadLimit} downloads remaining)
              </div>
            )}
          </div>
        </div>

        <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-8 flex flex-col justify-center min-w-[280px]">
          <Link href="/dashboard/pricing" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/30 transition-all text-center flex items-center justify-center gap-2">
            Upgrade Plan <span className="text-lg leading-none">→</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Card A: PAN Form Wallet */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Download className="w-24 h-24 text-indigo-500" />
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-wider group-hover:text-indigo-600 transition-colors">
              <Download className="w-5 h-5 text-indigo-500" />
              PAN Form Wallet
            </div>
          </div>
          <div className="text-5xl font-black text-slate-900 tracking-tighter relative z-10">
            {remainingDownloads} <span className="text-2xl text-slate-400 font-bold">/ {downloadLimit}</span>
          </div>
          <p className="text-slate-400 text-sm font-medium mt-3 relative z-10">
            Remaining Credits (Lifetime)
          </p>
        </div>

        {/* Card B: Premium Tools Access */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wrench className="w-24 h-24 text-purple-500" />
          </div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3 text-slate-500 font-bold text-sm uppercase tracking-wider group-hover:text-purple-600 transition-colors">
              <Wrench className="w-5 h-5 text-purple-500" />
              Premium Tools Access
            </div>
            {isFree ? (
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                7 Days Free Trial
              </span>
            ) : toolsActive ? (
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Expired
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight relative z-10">
            {isFree ? (
              "Free Tier"
            ) : toolsValidUntil ? (
              formatDate(toolsValidUntil, 'dd MMM yyyy')
            ) : (
              "-"
            )}
          </div>
          <p className="text-slate-400 text-sm font-medium mt-1 mb-6 relative z-10">
            {isFree ? "Upgrade for unlimited access" : toolsActive ? "Valid Until" : "Your tools access has expired"}
          </p>

        </div>

        {/* Total Generated Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm flex flex-col justify-center group relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown className="w-24 h-24 text-amber-500" />
          </div>
          <div className="flex items-center gap-3 text-slate-500 mb-6 font-bold text-sm uppercase tracking-wider relative z-10">
            <Crown className="w-5 h-5 text-amber-500" />
            Total Generated
          </div>
          <div className="text-5xl font-black text-slate-900 tracking-tighter relative z-10">
            {totalPdfs}
          </div>
          <p className="text-slate-400 text-sm font-medium mt-3 relative z-10">PDFs Generated (Lifetime)</p>
        </div>
      </div>

      {/* 3. LAST 5 TRANSACTIONS */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Recent Transactions</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
          {txns.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">Date</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {txns.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5 text-slate-700">{formatDate(new Date(txn.created_at), 'dd MMM yyyy')}</td>
                    <td className="px-6 py-5 text-slate-900 capitalize font-bold">
                      {txn.plan_type === 'per_form' ? 'Download' : 'Subscription'}
                    </td>
                    <td className="px-6 py-5 text-slate-900">₹{txn.amount}</td>
                    <td className="px-6 py-5">
                      {txn.status === 'PAID' ? (
                        <span className="text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-max">
                          <Check className="w-3 h-3" /> Success
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-50 px-3 py-1 rounded-full font-bold w-max inline-block">
                          {txn.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-12 text-center text-slate-500 font-medium">
              No transactions yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
