import {
  createContext,
  startTransition,
  useContext,
  useState,
  type PropsWithChildren
} from "react";
import { login as loginRequest } from "../lib/api";
import type { AdminSession } from "../types/api";

interface AuthContextValue {
  session: AdminSession | null;
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<AdminSession>;
  logout: () => void;
  updateSession: (changes: Partial<AdminSession>) => void;
}

const STORAGE_KEY = "redrive.admin.session";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredSession() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    return JSON.parse(stored) as AdminSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AdminSession | null>(() => readStoredSession());

  const login = async (email: string, password: string) => {
    const nextSession = await loginRequest({ email, password });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    startTransition(() => setSession(nextSession));
    return nextSession;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    startTransition(() => setSession(null));
  };

  const updateSession = (changes: Partial<AdminSession>) => {
    if (!session) {
      return;
    }

    const nextSession = { ...session, ...changes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    startTransition(() => setSession(nextSession));
  };

  const value: AuthContextValue = {
    session,
    isAuthenticated: Boolean(session),
    isSuperAdmin: session?.role === "SUPER_ADMIN",
    login,
    logout,
    updateSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
