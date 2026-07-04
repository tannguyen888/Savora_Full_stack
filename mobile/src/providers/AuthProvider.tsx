import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/lib/authStorage";
import { savouraClient } from "@/api/savouraClient";
import { UserProfile } from "@/types/domain";

type AuthContextType = {
  token: string | null;
  user: UserProfile | null;
  isLoading: boolean;
  refreshMe: () => Promise<UserProfile | null>;
  signOut: () => Promise<void>;
  setToken: (token?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshMe = async () => {
    try {
      const me = await savouraClient.auth.me();
      setUser(me);
      return me;
    } catch {
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    let mounted = true;

    (async () => {
      const existing = await getAuthToken();
      if (!mounted) return;
      setTokenState(existing);
      if (existing) {
        await refreshMe();
      }
      setIsLoading(false);
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const value = useMemo<AuthContextType>(() => {
    return {
      token,
      user,
      isLoading,
      refreshMe,
      signOut: async () => {
        await clearAuthToken();
        setTokenState(null);
        setUser(null);
      },
      setToken: async (next) => {
        await setAuthToken(next);
        setTokenState(next ?? null);
        if (next) {
          await refreshMe();
        } else {
          setUser(null);
        }
      }
    };
  }, [token, user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
