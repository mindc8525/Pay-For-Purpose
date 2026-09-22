"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const AuthContext = createContext({
  user: null,
  loading: true,
  signOut: async () => {},
  setMockUser: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function Providers({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // 1. Check local mock user session first (instant)
    try {
      const stored = localStorage.getItem("mock_user");
      if (stored) {
        setUser(JSON.parse(stored));
        setLoading(false);
      }
    } catch {}

    // 2. Check Supabase session with safety timeout
    const fetchUser = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Supabase auth timeout")), 1200)
        );
        const { data: { user: sbUser } } = await Promise.race([
          supabase.auth.getUser(),
          timeoutPromise,
        ]);
        if (sbUser) {
          setUser(sbUser);
        }
      } catch {
        // Fallback to local session if already set
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // 3. Listen to Supabase auth events
    let subscription;
    try {
      const authListener = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser(session.user);
        }
        router.refresh();
      });
      subscription = authListener?.data?.subscription;
    } catch {}

    // 4. Custom event for mock auth login/logout
    const handleAuthChange = (e) => {
      if (e.detail) {
        setUser(e.detail);
      } else {
        setUser(null);
      }
      router.refresh();
    };
    window.addEventListener("auth-change", handleAuthChange);

    return () => {
      subscription?.unsubscribe?.();
      window.removeEventListener("auth-change", handleAuthChange);
    };
  }, [supabase, router]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}

    try {
      localStorage.removeItem("mock_user");
      document.cookie = "sb-auth-token=; path=/; max-age=0";
      document.cookie = "sb-user-role=; path=/; max-age=0";
      document.cookie = "sb-access-token=; path=/; max-age=0";
      window.dispatchEvent(new CustomEvent("auth-change", { detail: null }));
    } catch {}

    setUser(null);
    router.push("/");
  };

  const setMockUser = (mockUser) => {
    try {
      localStorage.setItem("mock_user", JSON.stringify(mockUser));
      document.cookie = `sb-auth-token=${mockUser.id}; path=/; max-age=86400`;
      document.cookie = `sb-user-role=${mockUser.role}; path=/; max-age=86400`;
      window.dispatchEvent(new CustomEvent("auth-change", { detail: mockUser }));
    } catch {}
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut, setMockUser }}>
      {children}
    </AuthContext.Provider>
  );
}
