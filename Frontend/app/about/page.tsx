'use client';
import Link from 'next/link';

const TECH = [
  { icon: '⚛️',  name: 'Next.js 14',   desc: 'App router, SSR, client components' },
  { icon: '🐍',  name: 'Flask',         desc: 'Python REST API backend'             },
  { icon: '🗄️', name: 'MySQL',          desc: 'Relational DB with views & procs'   },
  { icon: '🎨',  name: 'Tailwind CSS',  desc: 'Utility-first styling'              },
  { icon: '📊',  name: 'Recharts',       desc: 'Area & bar chart visualisations'    },
  { icon: '🔑',  name: 'JWT Auth',       desc: 'Role-based staff access control'    },
];

const ROLES = [
  { badge: '👑', role: 'Admin',     color: '#F59E0B', desc: 'Full access to all modules — lots, rates, staff, analytics and all operations.' },
  { badge: '⚙️', role: 'Operator',  color: '#3B82F6', desc: 'Manage sessions, EV stations, loyalty cards and vehicle entries. Read-only on rates.' },
  { badge: '🚦', role: 'Attendant', color: '#10B981', desc: 'Record vehicle entries, process checkouts and manage spot availability at the gate.' },
];

const MODULES = [
  { icon: '⊡', title: 'Live Slot Grid',   desc: 'Real-time occupancy map across all lots with colour-coded slots by type and status.' },
  { icon: '⏱', title: 'Sessions',         desc: 'Full lifecycle management — entry, active tracking, checkout with loyalty integration.' },
  { icon: '⚡', title: 'EV Stations',     desc: 'Start/stop charging sessions, view station status and checkout EV vehicles.' },
  { icon: '🏢', title: 'Parking Lots',    desc: 'Create and manage lots with auto-generated spots, floor layouts and spot types.' },
  { icon: '🏆', title: 'Loyalty Program', desc: 'Bronze → Silver → Gold → Platinum tiers with points earn, redeem and card management.' },
  { icon: '₹',  title: 'Rates & Revenue', desc: 'Configurable per-type pricing and monthly revenue analytics with chart breakdowns.' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080B10', color: '#F0F4F8', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,16,0.94)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', height: 60, display: 'flex', alignItems: 'center', padding: '0 40px' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, background: '#2563EB', borderRadius: 8, display: 'grid', placeItems: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.4)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".9"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".6"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".6"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".9"/></svg>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: '#F0F4F8' }}>ParkGrid</span>
        </Link>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {[{ l: 'Home', h: '/' }, { l: 'Features', h: '/features' }, { l: 'Help', h: '/help' }].map(({ l, h }) => (
            <Link key={h} href={h} style={{ fontSize: 14, color: '#8A9BAE', textDecoration: 'none', padding: '5px 14px', borderRadius: 8 }}>{l}</Link>
          ))}
        </div>
        <Link href="/login" style={{ flexShrink: 0, fontSize: 13, color: 'white', background: '#2563EB', padding: '8px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 18px rgba(37,99,235,0.35)' }}>
          Sign In →
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 40px 64px', maxWidth: 1200, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.10) 0%, transparent 70%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.28)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#3B82F6', marginBottom: 20, fontWeight: 500 }}>
            🏢 About ParkGrid
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 50, fontWeight: 800, lineHeight: 1.08, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Smart parking,<br /><span style={{ color: '#2563EB' }}>beautifully managed.</span>
          </h1>
          <p style={{ fontSize: 16, color: '#8A9BAE', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.8, fontWeight: 300 }}>
            ParkGrid is a full-stack parking management system built for facilities that need real-time visibility, EV charging support, a loyalty rewards programme and detailed revenue analytics — all in a single unified dashboard.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563EB', color: 'white', padding: '13px 28px', borderRadius: 11, textDecoration: 'none', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 24px rgba(37,99,235,0.4)' }}>Open Dashboard →</Link>
            <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: '#F0F4F8', padding: '13px 26px', borderRadius: 11, textDecoration: 'none', fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}>See Features</Link>
          </div>
        </div>
      </section>

      {/* WHAT IT IS */}
      <section style={{ padding: '0 40px 72px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 22, padding: '48px 52px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#F0F4F8', marginBottom: 16, letterSpacing: '-0.02em' }}>What is ParkGrid?</h2>
            <p style={{ fontSize: 14, color: '#8A9BAE', lineHeight: 1.8, marginBottom: 16, fontWeight: 300 }}>
              ParkGrid replaces paper logs and spreadsheets with a live dashboard that shows every parking spot, every session and every rupee — in real time. Staff can record vehicle entries in seconds, checkout with UPI or cash, and let the system calculate charges automatically.
            </p>
            <p style={{ fontSize: 14, color: '#8A9BAE', lineHeight: 1.8, fontWeight: 300 }}>
              Loyalty members earn points on every visit and redeem them for discounts. EV station operators can start and stop charging sessions directly from the dashboard. Managers get monthly revenue breakdowns without running a single SQL query.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {[
              { val: '9',     label: 'Parking Lots',   color: '#3B82F6' },
              { val: '400+',  label: 'Parking Spots',  color: '#10B981' },
              { val: '25+',   label: 'EV Stations',    color: '#06B6D4' },
              { val: '4',     label: 'Loyalty Tiers',  color: '#F59E0B' },
            ].map(({ val, label, color }) => (
              <div key={label} style={{ background: '#131920', borderRadius: 14, padding: '20px 16px', textAlign: 'center', border: `1px solid ${color}18` }}>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 36, fontWeight: 800, color, lineHeight: 1, marginBottom: 6 }}>{val}</div>
                <div style={{ fontSize: 12, color: '#4A5568' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section style={{ padding: '0 40px 72px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Dashboard modules</h2>
          <p style={{ fontSize: 14, color: '#8A9BAE', maxWidth: 480, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>Six core modules covering every aspect of parking management.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {MODULES.map(({ icon, title, desc }) => (
            <div key={title} style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 26, display: 'flex', gap: 16, transition: 'all .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37,99,235,0.3)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(37,99,235,0.12)', display: 'grid', placeItems: 'center', fontSize: 20, flexShrink: 0, color: '#3B82F6' }}>{icon}</div>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F0F4F8', margin: '0 0 7px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#8A9BAE', lineHeight: 1.65, margin: 0 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STAFF ROLES */}
      <section style={{ padding: '0 40px 72px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Staff roles</h2>
          <p style={{ fontSize: 14, color: '#8A9BAE', maxWidth: 420, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>Three role tiers so every staff member gets exactly the access they need.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {ROLES.map(({ badge, role, color, desc }) => (
            <div key={role} style={{ background: '#0D1117', border: `1px solid ${color}20`, borderRadius: 18, padding: 28, textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${color}15`, display: 'grid', placeItems: 'center', fontSize: 26, margin: '0 auto 16px' }}>{badge}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color, margin: '0 0 10px', textTransform: 'capitalize' }}>{role}</h3>
              <p style={{ fontSize: 13, color: '#8A9BAE', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              <div style={{ marginTop: 18 }}>
                <Link href="/login" style={{ fontSize: 12, color, textDecoration: 'none', fontWeight: 600 }}>Sign in as {role} →</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TECH STACK */}
      <section style={{ padding: '0 40px 72px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>Built with</h2>
          <p style={{ fontSize: 14, color: '#8A9BAE', maxWidth: 400, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>A modern, production-ready technology stack.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {TECH.map(({ icon, name, desc }) => (
            <div key={name} style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14, transition: 'border-color .15s' }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37,99,235,0.3)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'}>
              <span style={{ fontSize: 24, flexShrink: 0 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F0F4F8', marginBottom: 3 }}>{name}</div>
                <div style={{ fontSize: 12, color: '#4A5568' }}>{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', borderRadius: 22, padding: '56px 52px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 12 }}>Try it now</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', marginBottom: 28, fontWeight: 300 }}>Log in as Admin, Operator or Attendant — no setup required.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#2563EB', padding: '13px 28px', borderRadius: 11, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>Open Dashboard →</Link>
              <Link href="/help" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: 'white', padding: '13px 24px', borderRadius: 11, textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)' }}>Help Center</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F0F4F8' }}>ParkGrid</span>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ l: 'Home', h: '/' }, { l: 'Features', h: '/features' }, { l: 'Help', h: '/help' }].map(({ l, h }) => (
              <Link key={h} href={h} style={{ fontSize: 13, color: '#4A5568', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#4A5568', margin: 0 }}>© 2025 ParkGrid. Smart Parking Management.</p>
        </div>
      </footer>
    </div>
  );
}
