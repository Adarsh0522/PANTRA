import DocResizerWrapper from "@/components/DocResizerWrapper";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "Document Resizer | PANTRA",
  description: "Smart Client-Side Document Resizer and PDF Converter",
};

export default async function ResizerPage() {
  const user = await getCurrentUser();
  let hasActiveTools = false;
  let remainingTrialDays = 0;

  if (user) {
    const sub = user.subscription as any;
    
    // Check active plan tools
    if (sub && sub.tools_active_until) {
      const activeUntil = new Date(sub.tools_active_until);
      if (activeUntil > new Date()) {
        hasActiveTools = true;
      }
    }
    
    // Check 7-day free trial if no active plan tools
    if (!hasActiveTools) {
      const createdAt = user.created_at ? new Date(user.created_at as string) : new Date();
      const trialEnds = new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);
      const now = new Date();
      
      if (trialEnds > now) {
        hasActiveTools = true;
        remainingTrialDays = Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      }
    }
  }

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <DocResizerWrapper hasActiveTools={hasActiveTools} remainingTrialDays={remainingTrialDays} />
    </div>
  );
}
