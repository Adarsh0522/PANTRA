import NextAuth, { type DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      mobile_number?: string | null;
      center_name?: string | null;
      role?: string | null;
    } & DefaultSession["user"];
  }

  interface User {
    mobile_number?: string | null;
    center_name?: string | null;
    role?: string | null;
  }
}
