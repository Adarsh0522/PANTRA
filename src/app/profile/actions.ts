"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { user_profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const profile = await db.query.user_profiles.findFirst({
    where: eq(user_profiles.user_id, session.user.id),
  });

  return profile;
}

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("unauthorized");
  }

  const ao_code = formData.get("ao_code") as string;
  const office_address = formData.get("office_address") as string;

  // Check if profile exists, otherwise insert
  const existingProfile = await db.query.user_profiles.findFirst({
    where: eq(user_profiles.user_id, session.user.id),
  });

  if (existingProfile) {
    await db
      .update(user_profiles)
      .set({
        ao_code,
        office_address,
        updated_at: new Date(),
      })
      .where(eq(user_profiles.user_id, session.user.id));
  } else {
    await db.insert(user_profiles).values({
      user_id: session.user.id,
      ao_code,
      office_address,
    });
  }

  revalidatePath("/profile");
}
