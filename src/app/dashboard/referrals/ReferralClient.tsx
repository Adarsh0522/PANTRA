"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Users, ShieldCheck } from "lucide-react";
import { claimReferralReward } from "./actions";

interface ReferralClientProps {
  referralCode: string;
  referredCount: number;
  convertedCount: number;
  canClaim: boolean;
}

export default function ReferralClient({ referralCode, referredCount, convertedCount, canClaim }: ReferralClientProps) {
  const [copied, setCopied] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [baseUrl, setBaseUrl] = useState("");

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  const referralLink = `${baseUrl}/?ref=${referralCode}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy", err);
    }
  };

  const handleClaim = async () => {
    setIsClaiming(true);
    try {
      const res = await claimReferralReward();
      if (res.success) {
        alert(res.message);
      } else {
        alert("Error: " + res.message);
      }
    } catch (error) {
      alert("Something went wrong");
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Code Copy */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 col-span-1 md:col-span-2 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-inner">
          <div className="flex-1 overflow-hidden">
            <div className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Your Unique Referral Link
            </div>
            <div className="font-mono text-xl sm:text-2xl font-black tracking-tight truncate text-white">
              {baseUrl ? referralLink : 'Loading...'}
            </div>
          </div>

          <button
            onClick={handleCopy}
            className="shrink-0 bg-white text-indigo-700 px-6 py-3.5 rounded-xl font-bold hover:bg-blue-50 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-black/10 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 text-emerald-600" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" /> Copy Link
              </>
            )}
          </button>
        </div>

        {/* Stats */}
        <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 flex flex-col justify-center shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2 text-blue-200 text-xs font-bold uppercase tracking-wider">
              <Users className="w-4 h-4" /> Referred
            </div>
            <div className="text-3xl font-black">{referredCount}</div>
          </div>
          <div className="h-px bg-white/20 w-full mb-4" />
          <div className="flex justify-between items-center">
            <div className="text-emerald-300 text-xs font-bold uppercase tracking-wider">Converted (Paid)</div>
            <div className="text-3xl font-black text-emerald-300">{convertedCount}</div>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-6 bg-white/5 p-6 rounded-2xl">
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-bold text-white mb-1">Claim Reward</h3>
          <span className="text-blue-200 font-medium text-sm">
            {canClaim
              ? "Congratulations! You have unlocked a free reward!"
              : "Refer 2 users who purchase a paid plan to unlock reward."}
          </span>
        </div>

        {canClaim ? (
          <button 
            onClick={handleClaim} 
            disabled={isClaiming}
            className="w-full sm:w-auto bg-gradient-to-r from-emerald-400 to-emerald-500 text-slate-900 px-8 py-4 rounded-xl font-black shadow-lg shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {isClaiming ? "Claiming..." : "Claim 1 Month Free"}
          </button>
        ) : (
          <button disabled className="w-full sm:w-auto bg-white/5 text-white/40 px-8 py-4 rounded-xl font-bold border border-white/10 cursor-not-allowed">
            Claim 1 Month Free
          </button>
        )}
      </div>
    </div>
  );
}
