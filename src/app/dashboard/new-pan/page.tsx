import { PanFormContainer } from "@/components/pan-form/PanFormContainer";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { user_profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const metadata = {
  title: "New PAN Form | PANTRA",
};

export default async function NewPanPage() {
  const user = await getCurrentUser();
  let profile = null;
  
  if (user) {
    profile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, user.id),
    });
  }

  return (
    <div className="w-full">
      <PanFormContainer noPadding initialProfile={profile} />
    </div>
  );
}
