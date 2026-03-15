'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser } = useAuth();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pg_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!user) setUser(parsed);
        setHydrated(true);
      } else {
        router.replace('/login');
      }
    } catch {
      router.replace('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) setHydrated(true);
  }, [user]);

  if (!hydrated) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080B10]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[#4A5568]">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-screen overflow-hidden" style={{ gridTemplateColumns: '220px 1fr', gridTemplateRows: '56px 1fr' }}>
      <div style={{ gridRow: '1 / -1' }}>
        <Sidebar />
      </div>
      <Topbar />
      <main className="overflow-y-auto bg-[#080B10]">
        {children}
      </main>
    </div>
  );
}
