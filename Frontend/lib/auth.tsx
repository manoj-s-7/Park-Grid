'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User { id?: number; name: string; email: string; role: string; }
interface AuthCtx { user: User | null; setUser: (u: User | null) => void; logout: () => void; }

const Ctx = createContext<AuthCtx>({ user: null, setUser: () => {}, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pg_user');
      if (stored) setUserState(JSON.parse(stored));
    } catch {}
  }, []);

  const setUser = (u: User | null) => {
    setUserState(u);
    if (u) localStorage.setItem('pg_user', JSON.stringify(u));
    else localStorage.removeItem('pg_user');
  };

  const logout = () => setUser(null);

  return <Ctx.Provider value={{ user, setUser, logout }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
