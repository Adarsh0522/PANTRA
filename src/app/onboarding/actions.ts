"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export async function submitOnboarding(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("unauthorized");
  }

  const mobile_number = formData.get("mobile_number") as string;
  const center_name = formData.get("center_name") as string;

  if (!mobile_number) {
    throw new Error("Mobile Number is required");
  }

  await db
    .update(users)
    .set({
      mobile_number,
      center_name: center_name || null,
    })
    .where(eq(users.id, session.user.id));

  // Redirect immediately sets the cookie/header and throws an internal NEXT error to halt execution
  redirect("/dashboard");
}
