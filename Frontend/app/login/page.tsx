'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import { login } from '@/lib/api';

// ── Demo accounts matching the DB seed data (staff table) ──
const DEMO_ACCOUNTS = [
  {
    role:  'admin',
    name:  'Admin User',
    email: 'admin@parking.local',
    badge: '👑',
    color: '#F59E0B',
    desc:  'Full access — all modules',
  },
  {
    role:  'operator',
    name:  'Operator One',
    email: 'op1@parking.local',
    badge: '⚙️',
    color: '#3B82F6',
    desc:  'Manage sessions & EV stations',
  },
  {
    role:  'attendant',
    name:  'Gate Attendant',
    email: 'gate1@parking.local',
    badge: '🚦',
    color: '#10B981',
    desc:  'Vehicle entry & checkout',
  },
];

const MINI_GRID = [
  'occupied','available','ev','occupied','available',
  'available','occupied','occupied','available','ev',
];

function slotStyle(t: string) {
  if (t === 'ev')       return { bg: 'rgba(6,182,212,0.3)',  bc: 'rgba(6,182,212,0.55)' };
  if (t === 'occupied') return { bg: 'rgba(239,68,68,0.28)', bc: 'rgba(239,68,68,0.5)'  };
  return { bg: 'rgba(16,185,129,0.22)', bc: 'rgba(16,185,129,0.45)' };
}

export default function LoginPage() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const { setUser } = useAuth();
  const router      = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    try {
      const data = await login(email, password);
      setUser(data.user);
      router.push('/dashboard');
    } catch {
      // Demo fallback — match against known staff accounts
      const match = DEMO_ACCOUNTS.find(a => a.email === email);
      if (password === 'password' && match) {
        setUser({ name: match.name, email: match.email, role: match.role });
        router.push('/dashboard');
      } else if (password === 'password') {
        // Any email with password "password" gets attendant access
        setUser({ name: email.split('@')[0] || 'Staff', email, role: 'attendant' });
        router.push('/dashboard');
      } else {
        setError('Incorrect password. Demo password is "password".');
      }
    } finally {
      setLoading(false);
    }
  }

  function loginAs(account: typeof DEMO_ACCOUNTS[0]) {
    setUser({ name: account.name, email: account.email, role: account.role });
    router.push('/dashboard');
  }

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh', fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* ── LEFT — Blue brand panel ──────────────────────────── */}
      <div style={{
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        padding: 48,
        background: 'linear-gradient(145deg,#1D4ED8 0%,#2563EB 40%,#1e3fa8 100%)',
      }}>
        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.05) 1px,transparent 1px)', backgroundSize: '50px 50px', pointerEvents: 'none' }} />
        {/* Blobs */}
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -150, right: -100, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 280, height: 280, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', top: 80, right: 60, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 'auto' }}>
            <div style={{ width: 32, height: 32, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" width="16" height="16">
                <rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".6"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".9"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, color: 'white' }}>ParkGrid</span>
          </Link>

          {/* Main copy */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 0' }}>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 38, fontWeight: 800, color: 'white', lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14 }}>
              Full control<br />of your<br />parking facility.
            </h1>
            <p style={{ fontSize: 15, fontWeight: 300, color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, maxWidth: 340, marginBottom: 36 }}>
              Real-time slot visibility, EV management, loyalty tracking and revenue analytics — all in one dashboard.
            </p>

            {/* Mini dashboard preview */}
            <div style={{ background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 18, padding: 20, maxWidth: 400 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                {['#FF5F57','#FEBC2E','#28C840'].map(c => <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />)}
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginLeft: 8 }}>parkgrid.dashboard</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 14 }}>
                {[['241','Total spots'],['₹18K','Today revenue'],['12','EV charging']].map(([n, l]) => (
                  <div key={l} style={{ background: 'rgba(255,255,255,0.08)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: 'white' }}>{n}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 1 }}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: 4 }}>
                {MINI_GRID.map((t, i) => {
                  const s = slotStyle(t);
                  return <div key={i} style={{ height: 14, borderRadius: 3, background: s.bg, border: `1px solid ${s.bc}` }} />;
                })}
              </div>
            </div>
          </div>

          {/* Role badges */}
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {['Live occupancy', 'EV charging', 'Loyalty rewards'].map(f => (
              <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center', fontSize: 10, color: 'white' }}>✓</div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT — Login form ───────────────────────────────── */}
      <div style={{ background: '#080B10', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 800, color: '#F0F4F8', marginBottom: 6 }}>Sign in</h2>
          <p style={{ fontSize: 14, fontWeight: 300, color: '#8A9BAE', marginBottom: 32 }}>Welcome back. Use your staff credentials to continue.</p>

          {error && (
            <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: '#EF4444', marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8A9BAE', marginBottom: 7, letterSpacing: '0.03em' }}>Email address</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@parking.local"
                style={{ width: '100%', background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#F0F4F8', fontSize: 14, padding: '11px 14px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#2563EB'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#8A9BAE', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  style={{ width: '100%', background: '#131920', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, color: '#F0F4F8', fontSize: 14, padding: '11px 40px 11px 14px', outline: 'none', fontFamily: "'DM Sans', sans-serif", boxSizing: 'border-box' }}
                  onFocus={e => e.target.style.borderColor = '#2563EB'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 15, padding: 0, lineHeight: 1 }}>
                  {showPass ? '🙈' : '👁'}
                </button>
              </div>
              <p style={{ fontSize: 11, color: '#4A5568', marginTop: 6 }}>Demo password for all accounts: <span style={{ color: '#F59E0B', fontWeight: 600 }}>"password"</span></p>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '12px', background: '#2563EB', color: 'white', borderRadius: 10, fontSize: 15, fontWeight: 600, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, boxShadow: '0 4px 20px rgba(37,99,235,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: "'DM Sans', sans-serif" }}>
              {loading ? (
                <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block' }} className="animate-spin" />Signing in…</>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 20px' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ fontSize: 12, color: '#4A5568' }}>or sign in as</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Demo staff accounts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {DEMO_ACCOUNTS.map(account => (
              <button key={account.email} onClick={() => loginAs(account)}
                style={{ width: '100%', padding: '12px 16px', background: '#131920', border: `1px solid ${account.color}25`, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left', transition: 'all .15s', fontFamily: "'DM Sans', sans-serif" }}
                onMouseEnter={e => { (e.currentTarget).style.background = '#1C2530'; (e.currentTarget).style.borderColor = `${account.color}55`; }}
                onMouseLeave={e => { (e.currentTarget).style.background = '#131920'; (e.currentTarget).style.borderColor = `${account.color}25`; }}>
                {/* Role icon */}
                <div style={{ width: 40, height: 40, borderRadius: 10, background: `${account.color}18`, display: 'grid', placeItems: 'center', fontSize: 18, flexShrink: 0 }}>
                  {account.badge}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: '#F0F4F8', marginBottom: 2 }}>{account.name}</div>
                  <div style={{ fontSize: 11, color: '#4A5568', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{account.email}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: `${account.color}18`, color: account.color, textTransform: 'capitalize' }}>
                    {account.role}
                  </div>
                  <div style={{ fontSize: 10, color: '#4A5568', marginTop: 3 }}>{account.desc}</div>
                </div>
              </button>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#4A5568', marginTop: 24 }}>
            Staff accounts are managed by your{' '}
            <span style={{ color: '#3B82F6' }}>system administrator</span>
          </p>
        </div>
      </div>
    </div>
  );
}
