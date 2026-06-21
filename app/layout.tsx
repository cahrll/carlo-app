import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";
import Providers from "@/components/providers";
import { getCurrentUser } from "@/lib/services/queries/current-user";
import { getProfile } from "@/lib/services/queries/profile";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Carlo",
  description: "Carlo is a project management platform for teams",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const profileResult = user ? await getProfile(user.id) : null;
  const initialProfile =
    profileResult && !profileResult.error ? profileResult.data ?? null : null;

  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <NextTopLoader
          color="var(--acc)"
          height={2}
          showSpinner={false}
          shadow="0 0 8px var(--acc),0 0 4px var(--acc)"
          speed={300}
          easing="ease"
        />
        <Providers initialUser={user} initialProfile={initialProfile}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
