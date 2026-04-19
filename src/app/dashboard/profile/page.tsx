import { getCurrentUser } from "@/lib/auth";
import { ProfileClient } from "./ProfileClient";

export const metadata = {
  title: "User Profile & Sessions | PANTRA",
};

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  // Pass the user mobile down so it can be shown read-only
  return <ProfileClient userMobile={user?.mobile_number || ""} />;
}
