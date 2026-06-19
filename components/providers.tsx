"use client";

import { AuthProvider } from "@/context/auth-context";
import { OrgProvider } from "@/context/org-context";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <OrgProvider>{children}</OrgProvider>
    </AuthProvider>
  );
}
