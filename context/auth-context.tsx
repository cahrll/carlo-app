"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/client";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  name: string;
  email: string;
  image_url: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  profileLoading: boolean;
  refreshProfile: () => Promise<void>;
  logout: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser = null,
  initialProfile = null,
}: {
  children: React.ReactNode;
  initialUser?: User | null;
  initialProfile?: Profile | null;
}) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(!initialUser);
  const [profileLoading, setProfileLoading] = useState(!initialProfile);

  // whose profile is currently loaded; lets us skip refetching on token
  // refresh / duplicate auth events where the user id has not changed
  const profileUserId = useRef<string | null>(
    initialProfile?.id ?? initialUser?.id ?? null
  );
  const mounted = useRef(true);

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_profile")
        .select("*")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      if (!mounted.current) return;
      setProfile(data ?? null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (mounted.current) setProfile(null);
    } finally {
      if (mounted.current) setProfileLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }
    await fetchProfile(user.id);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  useEffect(() => {
    mounted.current = true;

    const init = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const currentUser = data.user ?? null;
        if (!mounted.current) return;
        setUser(currentUser);

        if (currentUser) {
          if (profileUserId.current !== currentUser.id) {
            profileUserId.current = currentUser.id;
            await fetchProfile(currentUser.id);
          }
        } else {
          profileUserId.current = null;
          setProfile(null);
          setProfileLoading(false);
        }
      } catch (error) {
        console.error("Error loading auth:", error);
        if (!mounted.current) return;
        setUser(null);
        setProfile(null);
        setProfileLoading(false);
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    init();

    // Keep this callback synchronous: calling supabase methods directly inside
    // onAuthStateChange can deadlock supabase-js. Defer the fetch, and skip it
    // when the user id is unchanged (e.g. TOKEN_REFRESHED / cross-tab sync).
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);

      if (!nextUser) {
        profileUserId.current = null;
        setProfile(null);
        setProfileLoading(false);
        return;
      }

      if (profileUserId.current !== nextUser.id) {
        profileUserId.current = nextUser.id;
        setProfileLoading(true);
        setTimeout(() => {
          if (mounted.current) fetchProfile(nextUser.id);
        }, 0);
      }
    });

    return () => {
      mounted.current = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        profileLoading,
        refreshProfile,
        logout,
        setProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
