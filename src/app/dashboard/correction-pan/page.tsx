import { PanCorrectionContainer } from "@/components/pan-form/PanCorrectionContainer";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { user_profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "PAN Correction | PANTRA",
};

export default async function CorrectionPanPage() {
  const user = await getCurrentUser();
  let profile = null;
  
  if (user) {
    profile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, user.id),
    });
  }

  return (
    <div className="w-full">
      <PanCorrectionContainer initialProfile={profile} />
    </div>
  );
}
