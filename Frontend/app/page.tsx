'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const MINI_GRID = [
  'occupied','available','ev','occupied','available','occupied',
  'available','occupied','occupied','available','ev','available',
  'occupied','reserved','available','occupied','available','occupied',
  'ev','available',
];

function slotBg(t: string) {
  if (t === 'ev')       return { bg: 'rgba(6,182,212,0.3)',  bc: 'rgba(6,182,212,0.6)',  emoji: '⚡' };
  if (t === 'occupied') return { bg: 'rgba(239,68,68,0.28)', bc: 'rgba(239,68,68,0.55)', emoji: '🚗' };
  if (t === 'reserved') return { bg: 'rgba(245,158,11,0.28)',bc: 'rgba(245,158,11,0.55)',emoji: '🔒' };
  return { bg: 'rgba(16,185,129,0.20)', bc: 'rgba(16,185,129,0.4)', emoji: '' };
}

const FEATURES = [
  { icon: '⊡', color: '#3B82F6', title: 'Live Slot Grid',         desc: 'BookMyShow-style real-time map with colour-coded slots across all lots and floors.' },
  { icon: '⚡', color: '#06B6D4', title: 'EV Station Management',  desc: 'Start, monitor and checkout EV charging sessions with per-session billing.' },
  { icon: '📈', color: '#10B981', title: 'Revenue Analytics',      desc: 'Monthly charts, vehicle-type breakdowns and payment method analysis at a glance.' },
  { icon: '🏆', color: '#F59E0B', title: 'Loyalty Program',        desc: 'Gold, Silver and Bronze tier cards with points, tier upgrades and redemption.' },
  { icon: '🚗', color: '#8B5CF6', title: 'Vehicle Registry',       desc: 'Every vehicle, full session history and loyalty card linkage in one place.' },
  { icon: '₹',  color: '#EF4444', title: 'Dynamic Rates',          desc: 'Configure per-vehicle-type, per-spot-type pricing with minimum charges.' },
];

const STATS = [
  { val: '241+',  label: 'Parking Spots' },
  { val: '25+',   label: 'EV Stations'   },
  { val: '9',     label: 'Parking Lots'  },
  { val: '99.9%', label: 'Uptime'        },
];

export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#080B10', color: '#F0F4F8', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* ──────────────── NAV ──────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        height: 60,
        display: 'flex', alignItems: 'center',
        padding: '0 40px',
        background: scrolled ? 'rgba(8,11,16,0.96)' : 'rgba(8,11,16,0.5)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${scrolled ? 'rgba(255,255,255,0.08)' : 'transparent'}`,
        transition: 'all .3s',
      }}>
        {/* Logo — left */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
          <div style={{ width: 30, height: 30, background: '#2563EB', borderRadius: 8, display: 'grid', placeItems: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.45)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14">
              <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
              <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
              <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
              <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
            </svg>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: '#F0F4F8', letterSpacing: '-0.01em' }}>ParkGrid</span>
        </Link>

        {/* Centre nav links */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
          {[{ label: 'Features', href: '/features' }, { label: 'Help', href: '/help' }, { label: 'About', href: '/about' }].map(({ label, href }) => (
            <Link key={href} href={href}
              style={{ fontSize: 14, color: '#8A9BAE', textDecoration: 'none', padding: '5px 14px', borderRadius: 8, transition: 'all .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#F0F4F8'; (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#8A9BAE'; (e.currentTarget as HTMLAnchorElement).style.background = 'transparent'; }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Right — CTA */}
        <Link href="/login"
          style={{ flexShrink: 0, fontSize: 13, color: 'white', background: '#2563EB', padding: '8px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 18px rgba(37,99,235,0.35)', transition: 'all .15s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#3B82F6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.background = '#2563EB'; }}>
          Sign In →
        </Link>
      </nav>

      {/* ──────────────── HERO ─────────────────────────────────── */}
      <section style={{ position: 'relative', overflow: 'hidden', minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center' }}>
        {/* Radial glow */}
        <div style={{ position: 'absolute', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)', top: '40%', left: '40%', transform: 'translate(-50%,-50%)', pointerEvents: 'none' }} />
        {/* Dot grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '32px 32px', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', width: '100%', position: 'relative', zIndex: 2 }}>

          {/* Left copy */}
          <div>
            {/* Pill badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 100, padding: '5px 14px', fontSize: 12, color: '#3B82F6', marginBottom: 28, fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3B82F6', display: 'inline-block', animation: 'pulse 2s infinite' }} />
              Smart Parking Management System
            </div>

            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 58, fontWeight: 800, lineHeight: 1.06, letterSpacing: '-0.03em', marginBottom: 24 }}>
              Full control of<br />
              <span style={{ color: '#2563EB' }}>your parking</span><br />
              facility.
            </h1>

            <p style={{ fontSize: 17, color: '#8A9BAE', lineHeight: 1.8, maxWidth: 440, marginBottom: 36, fontWeight: 300 }}>
              Real-time slot visibility, EV charging management, loyalty tracking and revenue analytics — one unified dashboard.
            </p>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#2563EB', color: 'white', padding: '14px 30px', borderRadius: 11, textDecoration: 'none', fontSize: 15, fontWeight: 700, boxShadow: '0 4px 28px rgba(37,99,235,0.4)' }}>
                Open Dashboard →
              </Link>
              <Link href="/features" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.05)', color: '#F0F4F8', padding: '14px 28px', borderRadius: 11, textDecoration: 'none', fontSize: 15, fontWeight: 500, border: '1px solid rgba(255,255,255,0.1)' }}>
                See Features
              </Link>
            </div>

            {/* Social proof row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 40 }}>
              <div style={{ display: 'flex' }}>
                {['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'].map((c, i) => (
                  <div key={i} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: '2px solid #080B10', marginLeft: i ? -8 : 0, display: 'grid', placeItems: 'center', fontSize: 11 }}>
                    {['👑','⚙️','🚦','🅿️','⚡'][i]}
                  </div>
                ))}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F4F8' }}>3 staff roles · demo ready</div>
                <div style={{ fontSize: 11, color: '#4A5568' }}>admin · operator · attendant</div>
              </div>
            </div>
          </div>

          {/* Right — Dashboard preview card */}
          <div style={{ position: 'relative' }}>
            {/* Main card */}
            <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22, padding: 24, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
              {/* Window chrome */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 18 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c }} />)}
                <span style={{ fontSize: 11, color: '#4A5568', marginLeft: 8, fontFamily: 'monospace' }}>parkgrid — dashboard</span>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
                  <span style={{ fontSize: 10, color: '#10B981' }}>Live</span>
                </div>
              </div>

              {/* KPI row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                {[
                  { icon: '🅿️', val: '141/241', label: 'Spots occupied', color: '#3B82F6' },
                  { icon: '₹',  val: '18,420',  label: "Today's revenue", color: '#10B981' },
                  { icon: '⚡', val: '9/25',    label: 'EV charging',     color: '#06B6D4' },
                ].map(({ icon, val, label, color }) => (
                  <div key={label} style={{ background: '#131920', borderRadius: 11, padding: '12px 14px', border: `1px solid ${color}20` }}>
                    <div style={{ fontSize: 15, marginBottom: 4 }}>{icon}</div>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
                    <div style={{ fontSize: 9, color: '#4A5568', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Slot grid preview */}
              <div style={{ background: '#131920', borderRadius: 11, padding: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 10, color: '#4A5568', marginBottom: 10 }}>Live Slot Grid · Floor 1</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
                  {MINI_GRID.map((t, i) => {
                    const s = slotBg(t);
                    return (
                      <div key={i} style={{ height: 28, borderRadius: 5, background: s.bg, border: `1px solid ${s.bc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>
                        {s.emoji}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div style={{ position: 'absolute', bottom: -18, left: -20, background: '#131920', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
              <div style={{ width: 32, height: 32, background: 'rgba(16,185,129,0.15)', borderRadius: 9, display: 'grid', placeItems: 'center', fontSize: 16, color: '#10B981' }}>✓</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#F0F4F8' }}>100 spots available</div>
                <div style={{ fontSize: 10, color: '#4A5568' }}>Updated just now</div>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div style={{ position: 'absolute', top: -14, right: -16, background: '#131920', border: '1px solid rgba(6,182,212,0.25)', borderRadius: 12, padding: '9px 14px', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}>
              <span style={{ fontSize: 16 }}>⚡</span>
              <div>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#06B6D4' }}>9 EVs charging</div>
                <div style={{ fontSize: 10, color: '#4A5568' }}>16 stations online</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ──────────────── STATS STRIP ──────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)', padding: '36px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
          {STATS.map(({ val, label }) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 42, fontWeight: 800, color: '#2563EB', lineHeight: 1, marginBottom: 6 }}>{val}</div>
              <div style={{ fontSize: 13, color: '#8A9BAE' }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── HOW IT WORKS ─────────────────────────── */}
      <section style={{ padding: '88px 40px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#10B981', marginBottom: 16, fontWeight: 500 }}>🚀 How it works</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 14 }}>From entry to checkout</h2>
          <p style={{ fontSize: 15, color: '#8A9BAE', maxWidth: 480, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>Four simple steps to manage every vehicle through your facility.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
          {[
            { num: '01', icon: '🚗', title: 'Vehicle Entry',     desc: 'Scan or enter the plate, pick a spot, optionally issue a loyalty card — done in seconds.' },
            { num: '02', icon: '⊡', title: 'Live Tracking',      desc: 'Watch the slot grid update in real time. EV stations pulse when charging.' },
            { num: '03', icon: '💳', title: 'Smart Checkout',    desc: 'Auto-calculated fare with loyalty point redemption and UPI/Cash/Card payment.' },
            { num: '04', icon: '📈', title: 'Revenue Analytics', desc: 'Every transaction feeds into monthly charts and payment method breakdowns.' },
          ].map(({ num, icon, title, desc }) => (
            <div key={num} style={{ position: 'relative', background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, transition: 'all .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(37,99,235,0.4)'; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 11, fontWeight: 800, color: '#2563EB', letterSpacing: '0.12em', marginBottom: 12 }}>{num}</div>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#F0F4F8', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#8A9BAE', lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ──────────────── FEATURES GRID ────────────────────────── */}
      <section style={{ padding: '0 40px 88px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.10)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#3B82F6', marginBottom: 16, fontWeight: 500 }}>🧩 Platform Features</div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 40, fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 14 }}>Everything you need</h2>
          <p style={{ fontSize: 15, color: '#8A9BAE', maxWidth: 520, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>One platform for real-time slot management, EV charging, loyalty rewards and full revenue reporting.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {FEATURES.map(({ icon, color, title, desc }) => (
            <div key={title} style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 28, transition: 'all .2s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}40`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.07)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
              <div style={{ width: 46, height: 46, background: `${color}18`, borderRadius: 13, display: 'grid', placeItems: 'center', fontSize: 22, marginBottom: 18, color }}>{icon}</div>
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#F0F4F8', marginBottom: 10 }}>{title}</h3>
              <p style={{ fontSize: 13, color: '#8A9BAE', lineHeight: 1.7, margin: 0 }}>{desc}</p>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link href="/features" style={{ fontSize: 14, color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>View all features →</Link>
        </div>
      </section>

      {/* ──────────────── CTA BAND ─────────────────────────────── */}
      <section style={{ padding: '0 40px 88px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#1D4ED8 0%,#2563EB 50%,#1e3fa8 100%)', borderRadius: 24, padding: '64px 56px', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', bottom: -200, right: -100, pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 34, fontWeight: 800, color: 'white', marginBottom: 10, letterSpacing: '-0.02em' }}>
              Ready to manage smarter?
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.65)', margin: 0, fontWeight: 300 }}>
              Log in with demo credentials. Admin, Operator or Attendant role — your choice.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, position: 'relative', zIndex: 2, flexShrink: 0 }}>
            <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#2563EB', padding: '14px 28px', borderRadius: 11, textDecoration: 'none', fontSize: 15, fontWeight: 700, whiteSpace: 'nowrap' }}>
              Open Dashboard →
            </Link>
            <Link href="/help" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: 'white', padding: '14px 24px', borderRadius: 11, textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)', whiteSpace: 'nowrap' }}>
              Help Center
            </Link>
          </div>
        </div>
      </section>

      {/* ──────────────── FOOTER ───────────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '28px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 24, height: 24, background: '#2563EB', borderRadius: 6, display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="11" height="11">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F0F4F8' }}>ParkGrid</span>
          </Link>
          <div style={{ display: 'flex', gap: 24 }}>
            {[{ l: 'Features', h: '/features' }, { l: 'Help', h: '/help' }, { l: 'About', h: '/about' }, { l: 'Dashboard', h: '/login' }].map(({ l, h }) => (
              <Link key={h} href={h} style={{ fontSize: 13, color: '#4A5568', textDecoration: 'none' }}>{l}</Link>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#4A5568', margin: 0 }}>© 2025 ParkGrid. Smart Parking Management.</p>
        </div>
      </footer>

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
    </div>
  );
}
