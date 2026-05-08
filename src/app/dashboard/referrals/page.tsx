import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { referrals, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import ReferralClient from "./ReferralClient";
import crypto from "crypto";
import { Crown, CheckCircle2, Clock } from "lucide-react";
import { formatDate } from "date-fns";

export default async function ReferralsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // Fetch or Create Referral
  let userReferral = await db.query.referrals.findFirst({
    where: eq(referrals.user_id, user.id)
  });

  if (!userReferral) {
    const code = (user.mobile_number || "0000").slice(-4) + Math.random().toString(36).substring(2, 6).toUpperCase();
    const newRefs = await db.insert(referrals).values({
      id: crypto.randomUUID(),
      user_id: user.id,
      referral_code: code,
    }).returning();
    userReferral = newRefs[0];
  }

  const { referred_users_count, converted_users_count, referral_code } = userReferral;

  // Fetch Referred Users List
  const referredUsersList = await db.query.users.findMany({
    where: eq(users.referred_by, user.id),
    orderBy: [desc(users.created_at)]
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Refer & Earn</h1>
        <p className="text-slate-500 mt-1 font-medium">Invite friends to PANTRA and get rewarded with free subscriptions.</p>
      </div>

      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
              <Crown className="w-8 h-8 text-amber-300" />
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">Automatic Rewards!</h2>
          </div>
          
          <p className="text-blue-100 mb-10 text-lg font-medium max-w-2xl leading-relaxed">
            Refer a friend. If they buy a single form, you get 1 Free Form. If they buy a Subscription, you instantly get 1 Month of Premium Tools Free. Rewards are credited automatically!
          </p>

          <ReferralClient 
            referralCode={referral_code} 
            referredCount={referred_users_count} 
            convertedCount={converted_users_count} 
          />
        </div>

        {/* Decorative BG Elements */}
        <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 pointer-events-none">
          <Crown className="w-96 h-96" />
        </div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Referred Users List */}
      <div className="mt-12">
        <h2 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight">Your Referrals</h2>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden text-sm">
          {referredUsersList.length > 0 ? (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-xs tracking-wider">
                <tr>
                  <th className="px-6 py-4 rounded-tl-2xl">User Details</th>
                  <th className="px-6 py-4">Center Name</th>
                  <th className="px-6 py-4">Joined On</th>
                  <th className="px-6 py-4 rounded-tr-2xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {referredUsersList.map((refUser) => (
                  <tr key={refUser.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="text-slate-900 font-bold">{refUser.name || 'Anonymous User'}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{refUser.mobile_number ? `+91 ${refUser.mobile_number}` : refUser.email}</div>
                    </td>
                    <td className="px-6 py-5 text-slate-700 capitalize">
                      {refUser.center_name || '-'}
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {formatDate(new Date(refUser.created_at), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-5">
                      {refUser.is_referral_converted ? (
                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-max text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Converted
                        </span>
                      ) : (
                        <span className="text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full font-bold flex items-center gap-1.5 w-max text-xs">
                          <Clock className="w-3.5 h-3.5" /> Pending Purchase
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Crown className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">No referrals yet</h3>
              <p className="text-slate-500 font-medium">Share your link to start earning free subscriptions!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
