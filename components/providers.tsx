"use client";

import type { User } from "@supabase/supabase-js";
import { AuthProvider } from "@/context/auth-context";
import { OrgProvider } from "@/context/org-context";
import { DeletionsProvider } from "@/context/deletions-context";

type InitialProfile = {
  id: string;
  name: string;
  email: string;
  image_url: string;
  created_at: string;
  updated_at: string;
} | null;

export default function Providers({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: InitialProfile;
}) {
  return (
    <AuthProvider initialUser={initialUser} initialProfile={initialProfile}>
      <OrgProvider>
        <DeletionsProvider>{children}</DeletionsProvider>
      </OrgProvider>
    </AuthProvider>
  );
}
