import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/db";
import { user_profiles, sessions, users } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import crypto from "crypto";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Fetch User from users table (for name, email, center_name, mobile_number)
    const userRecord = await db.query.users.findFirst({
      where: eq(users.id, user.id),
    });

    // Fetch Profile
    const profile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, user.id),
    });

    // Fetch Sessions (fixing column names from schema)
    const activeSessions = await db.query.sessions.findMany({
      where: eq(sessions.userId, user.id),
      orderBy: [asc(sessions.created_at)],
    });

    return NextResponse.json({
      profile: {
        ...profile,
        full_name: userRecord?.name || profile?.full_name || "",
        email: userRecord?.email || profile?.email || "",
        center_name: userRecord?.center_name || profile?.center_name || "",
      },
      sessions: activeSessions.map(s => ({
        id: s.sessionToken,
        ip_address: null, // NextAuth default sessions don't store IP or device info easily unless customized
        device_info: "Standard Web Session",
        last_active_at: s.created_at,
      })),
    });
  } catch (error: any) {
    console.error("Profile GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();

    // Update the base users table
    await db.update(users)
      .set({
        name: body.full_name,
        email: body.email,
        center_name: body.center_name,
      })
      .where(eq(users.id, user.id));

    // Check if profile exists
    const existingProfile = await db.query.user_profiles.findFirst({
      where: eq(user_profiles.user_id, user.id),
    });

    if (existingProfile) {
      await db.update(user_profiles)
        .set({
          ...body,
          updated_at: new Date(),
        })
        .where(eq(user_profiles.id, existingProfile.id));
    } else {
      await db.insert(user_profiles).values({
        id: crypto.randomUUID(),
        user_id: user.id,
        ...body,
        created_at: new Date(),
        updated_at: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Profile PUT Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
