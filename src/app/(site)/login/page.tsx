import { ShieldCheck } from "lucide-react";
import { signIn } from "@/auth";

export default function LoginPage() {
  return (
    <div className="h-screen w-full bg-white flex overflow-hidden">
      {/* Left Column: Branding (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 flex-col justify-center px-20 relative">
        <div className="absolute top-10 left-10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-blue-500" />
            <span className="text-xl font-black text-white tracking-widest uppercase">PANTRA</span>
          </div>
        </div>

        <div className="space-y-8 relative z-10">
          <img
            src="/pantra-logo.svg"
            alt="PANTRA Logo"
            className="w-48 h-auto mb-10 brightness-0 invert opacity-90"
          />
          <h1 className="text-5xl font-black text-white leading-tight">
            The Professional <br />
            <span className="text-blue-500">PAN Platform</span>
          </h1>
          <div className="space-y-4">
            {[
              "Real-time PAN Correction & Status",
              "Instant Document Generation",
              "Bulk Agency Management",
              "Fast & Secure Processing"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-4 text-slate-300 font-medium">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                {benefit}
              </div>
            ))}
          </div>
        </div>

        {/* Artistic Background Accent */}
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px]" />
      </div>

      {/* Right Column: Authentication Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-12 bg-white h-full relative">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-black tracking-widest uppercase">PANTRA</span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">
              Sign In
            </h2>
            <p className="mt-2 text-slate-600 font-medium">
              Access your agency dashboard using your Google account
            </p>
          </div>

          <div className="space-y-6">
            <form
              action={async () => {
                "use server";
                await signIn("google", { redirectTo: "/dashboard" });
              }}
            >
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-3 h-[52px] bg-white border-2 border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 text-lg font-bold rounded-xl transition-all shadow-sm"
              >
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </button>
            </form>
          </div>

          <div className="mt-12 text-center">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
              By logging in, you agree to our <br />
              <span className="text-slate-900 underline cursor-pointer">Terms of Service</span> and <span className="text-slate-900 underline cursor-pointer">Privacy Policy</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
