'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';

const PAGE_TITLES: Record<string, { title: string; sub: string }> = {
  '/dashboard':          { title: 'Overview',     sub: 'Real-time snapshot of your facility' },
  '/dashboard/grid':     { title: 'Slot Grid',    sub: 'Live occupancy map' },
  '/dashboard/sessions': { title: 'Sessions',     sub: 'Parking sessions & checkout' },
  '/dashboard/vehicles': { title: 'Vehicles',     sub: 'Registered vehicles' },
  '/dashboard/ev':       { title: 'EV Stations',  sub: 'Charging station management' },
  '/dashboard/lots':     { title: 'Parking Lots', sub: 'Lot & spot management' },
  '/dashboard/loyalty':  { title: 'Loyalty',      sub: 'Cards, points & tiers' },
  '/dashboard/rates':    { title: 'Rates',        sub: 'Pricing configuration' },
  '/dashboard/revenue':  { title: 'Revenue',      sub: 'Analytics & reporting' },
};

export default function Topbar() {
  const path  = usePathname();
  const { user } = useAuth();
  const info  = PAGE_TITLES[path] || { title: 'ParkGrid', sub: '' };
  const now   = new Date().toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      height: 56,
      background: '#0D1117',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      flexShrink: 0,
    }}>
      <div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#F0F4F8', margin: 0, lineHeight: 1 }}>
          {info.title}
        </h1>
        {info.sub && (
          <p style={{ fontSize: 11, color: '#4A5568', margin: '2px 0 0', lineHeight: 1 }}>{info.sub}</p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 12, color: '#4A5568' }}>{now}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', background: 'rgba(16,185,129,0.1)', borderRadius: 100, border: '1px solid rgba(16,185,129,0.2)' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
          <span style={{ fontSize: 11, color: '#10B981', fontWeight: 500 }}>Backend {process.env.NEXT_PUBLIC_API_URL ? 'Connected' : 'Demo Mode'}</span>
        </div>
        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#3B82F6)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: 'white' }}>
          {user?.name?.charAt(0).toUpperCase() || 'A'}
        </div>
      </div>
    </header>
  );
}
