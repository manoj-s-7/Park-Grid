'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const NAV = [
  { label: 'Overview',     icon: '⊞', href: '/dashboard' },
  { label: 'Slot Grid',    icon: '⊡', href: '/dashboard/grid' },
  { label: 'Sessions',     icon: '⏱', href: '/dashboard/sessions' },
  { label: 'Vehicles',     icon: '🚗', href: '/dashboard/vehicles' },
  { label: 'EV Stations',  icon: '⚡', href: '/dashboard/ev' },
  { label: 'Parking Lots', icon: '🏢', href: '/dashboard/lots' },
  { label: 'Loyalty',      icon: '🏆', href: '/dashboard/loyalty' },
  { label: 'Rates',        icon: '₹',  href: '/dashboard/rates' },
  { label: 'Revenue',      icon: '📈', href: '/dashboard/revenue' },
];

const SECTIONS = [
  { label: 'Overview',   items: ['Overview', 'Slot Grid'] },
  { label: 'Operations', items: ['Sessions', 'Vehicles', 'EV Stations'] },
  { label: 'Management', items: ['Parking Lots', 'Loyalty', 'Rates'] },
  { label: 'Analytics',  items: ['Revenue'] },
];

export default function Sidebar() {
  const path   = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() { logout(); router.push('/login'); }

  return (
    <aside style={{
      display: 'flex', flexDirection: 'column',
      background: '#0D1117', borderRight: '1px solid rgba(255,255,255,0.06)',
      height: '100%', overflow: 'hidden',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', height: 56, borderBottom: '1px solid rgba(255,255,255,0.06)', textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: 28, height: 28, background: '#2563EB', borderRadius: 7, display: 'grid', placeItems: 'center', boxShadow: '0 0 12px rgba(37,99,235,0.4)', flexShrink: 0 }}>
          <svg viewBox="0 0 24 24" fill="none" width="13" height="13">
            <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
            <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
            <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
            <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
          </svg>
        </div>
        <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#F0F4F8' }}>ParkGrid</span>
      </Link>

      {/* Nav sections */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
        {SECTIONS.map(sec => (
          <div key={sec.label}>
            <p style={{ fontSize: 9.5, fontWeight: 600, color: '#4A5568', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '12px 20px 4px' }}>
              {sec.label}
            </p>
            {NAV.filter(n => sec.items.includes(n.label)).map(item => {
              const active = path === item.href || (item.href !== '/dashboard' && path.startsWith(item.href));
              return (
                <Link key={item.href} href={item.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 20px',
                  textDecoration: 'none',
                  fontSize: 13,
                  color: active ? '#F0F4F8' : '#8A9BAE',
                  background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
                  position: 'relative',
                  transition: 'all .15s',
                }}>
                  {active && (
                    <span style={{ position: 'absolute', left: 0, top: 4, bottom: 4, width: 3, background: '#2563EB', borderRadius: '0 3px 3px 0' }} />
                  )}
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Divider */}
        <div style={{ height: 1, background: 'rgba(255,255,255,0.05)', margin: '12px 16px' }} />

        {/* Help + Features links */}
        {[
          { icon: '🧩', label: 'Features', href: '/features' },
          { icon: '❓', label: 'Help Center', href: '/help' },
        ].map(item => {
          const active = path === item.href;
          return (
            <Link key={item.href} href={item.href} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 20px',
              textDecoration: 'none',
              fontSize: 13,
              color: active ? '#F0F4F8' : '#8A9BAE',
              background: active ? 'rgba(37,99,235,0.12)' : 'transparent',
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 15 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User footer */}
      <div style={{ padding: 16, borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#3B82F6)', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 700, color: 'white', flexShrink: 0 }}>
            {user?.name?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#F0F4F8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>
              {user?.name || 'Admin'}
            </p>
            <p style={{ fontSize: 11, color: '#4A5568', margin: 0, textTransform: 'capitalize' }}>{user?.role || 'staff'}</p>
          </div>
          <button onClick={handleLogout} title="Logout" style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 16, padding: 4, borderRadius: 6, lineHeight: 1 }}>
            ⇥
          </button>
        </div>
      </div>
    </aside>
  );
}
