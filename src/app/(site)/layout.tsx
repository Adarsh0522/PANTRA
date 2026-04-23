import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ReferralTracker from "@/components/referral/ReferralTracker";
import { Suspense } from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Suspense fallback={null}>
        <ReferralTracker />
      </Suspense>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
