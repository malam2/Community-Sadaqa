import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  AuthUser,
  getStoredUser,
  logout as authLogout,
  createGuestUser,
  storeUser,
} from "@/lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isGuest: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => Promise<void>;
  continueAsGuest: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isGuest = user?.isGuest ?? false;

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await getStoredUser();
        setUser(storedUser);
      } catch (error) {
        console.error("Failed to load user:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const logout = async () => {
    await authLogout();
    setUser(null);
  };

  const continueAsGuest = async () => {
    const guestUser = createGuestUser();
    await storeUser(guestUser);
    setUser(guestUser);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isGuest, setUser, logout, continueAsGuest }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
