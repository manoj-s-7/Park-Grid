'use client';
import Link from 'next/link';

const FEATURES = [
  {
    category: 'Core Operations',
    color: '#3B82F6',
    items: [
      { icon: '⊡', title: 'Live Slot Grid', desc: 'BookMyShow-style visual parking map with colour-coded slots. Green = free, Red = occupied, Blue = EV, Yellow = reserved. Hover any slot for details. Filter by lot, floor, or status in real time.', badge: 'Real-time' },
      { icon: '⏱', title: 'Session Management', desc: 'Record vehicle entries, run full checkout with UPI/Cash/Card payment, apply loyalty discounts, and cancel sessions. Every session auto-calculates duration and charges based on your rate config.', badge: 'Full CRUD' },
      { icon: '🚗', title: 'Vehicle Entry', desc: 'Enter any vehicle by plate number and optional owner name. Automatically links existing loyalty cards. Optionally issue a new loyalty card on the spot. Supports cars, bikes, and trucks.', badge: 'Smart Entry' },
    ],
  },
  {
    category: 'EV Charging',
    color: '#06B6D4',
    items: [
      { icon: '⚡', title: 'EV Station Management', desc: 'Start charging sessions by booking any available EV station. Full checkout support with duration-based billing. Supports Type 2, CCS and CHAdeMO connectors. Toggle offline/available per station.', badge: 'EV Ready' },
      { icon: '🔌', title: 'Station Status Tracking', desc: 'Live status per station: Charging, Available, Offline or Reserved. Pulsing glow animation on active charging stations. Filter by lot or status across your entire EV fleet.', badge: 'Live Status' },
    ],
  },
  {
    category: 'Loyalty Program',
    color: '#F59E0B',
    items: [
      { icon: '👑', title: 'Gold / Silver / Bronze Cards', desc: 'Glossy animated credit card visuals per tier. Automatic tier upgrade when points cross 500 (Silver) or 1,500 (Gold). Points earned = ₹1 per ₹10 paid at checkout.', badge: 'Tiered' },
      { icon: '🎁', title: 'Points Redemption', desc: 'Redeem points during checkout: 100 pts = ₹10 discount. Manual redemption also available from the Loyalty page. Track full redemption history per card.', badge: '100 pts = ₹10' },
      { icon: '➕', title: 'Manual Points', desc: 'Add bonus points with a custom reason (promotions, corrections). Full audit log maintained. Issue new loyalty cards to any registered vehicle in one click.', badge: 'Flexible' },
    ],
  },
  {
    category: 'Analytics & Revenue',
    color: '#10B981',
    items: [
      { icon: '📈', title: 'Revenue Analytics', desc: 'Monthly revenue chart for the last 12 months. Breakdown by vehicle type (Car, Bike, Truck) and payment method (UPI, Cash, Card). Track last month, last quarter, and 12-month totals.', badge: '12-Month View' },
      { icon: '🏢', title: 'Lot Occupancy', desc: 'Per-lot occupancy percentage with animated progress bars. Color-coded: green < 50%, amber 50–80%, red > 80%. Available, occupied, and reserved counts per lot at a glance.', badge: 'Live' },
    ],
  },
  {
    category: 'Configuration',
    color: '#8B5CF6',
    items: [
      { icon: '₹', title: 'Dynamic Pricing Rates', desc: 'Configure rate per hour and minimum charge for every combination of vehicle type × spot type. Supports standard, EV, and disabled spots. Set effective dates per rate. Edit or delete any rate.', badge: 'Configurable' },
      { icon: '🏗', title: 'Lot & Spot Management', desc: 'Create parking lots with auto-generated spots across multiple floors. View all spots in a mini grid per lot. Delete lots. Add bulk spots to any existing lot.', badge: 'Flexible' },
    ],
  },
];

const QUICK_STARTS = [
  { step: '1', title: 'Log in', desc: 'Use your email + password to sign in. Demo: any email + "password".' },
  { step: '2', title: 'Record a vehicle entry', desc: 'Go to Sessions → New Entry. Enter plate, pick a spot, optionally issue loyalty card.' },
  { step: '3', title: 'Checkout when done', desc: 'Click Checkout on any active session. Choose payment method, optionally apply loyalty discount.' },
  { step: '4', title: 'Manage EV charging', desc: 'Go to EV Stations → Start Charging on any available station. Checkout when the vehicle leaves.' },
];

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#080B10', fontFamily: "'DM Sans', sans-serif", color: '#F0F4F8' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(8,11,16,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, background: '#2563EB', borderRadius: 7, display: 'grid', placeItems: 'center', boxShadow: '0 0 14px rgba(37,99,235,0.4)' }}>
            <svg viewBox="0 0 24 24" fill="none" width="14" height="14"><rect x="3" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".9"/><rect x="14" y="3" width="7" height="7" rx="1.5" fill="white" opacity=".6"/><rect x="3" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".6"/><rect x="14" y="14" width="7" height="7" rx="1.5" fill="white" opacity=".9"/></svg>
          </div>
          <span style={{ fontFamily: 'Syne, sans-serif', fontSize: 17, fontWeight: 800, color: '#F0F4F8' }}>ParkGrid</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {[{ label: 'Home', href: '/' }, { label: 'Help', href: '/help' }, { label: 'About', href: '/about' }].map(({ label, href }) => (
            <Link key={href} href={href} style={{ fontSize: 14, color: '#8A9BAE', textDecoration: 'none', padding: '6px 14px', borderRadius: 8 }}>{label}</Link>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
          <Link href="/login" style={{ fontSize: 14, color: 'white', background: '#2563EB', padding: '8px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}>Sign In →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 48px 60px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#3B82F6', marginBottom: 20, fontWeight: 500 }}>
          🧩 Platform Features
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 18, color: '#F0F4F8' }}>
          Everything ParkGrid can do
        </h1>
        <p style={{ fontSize: 16, color: '#8A9BAE', maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.75, fontWeight: 300 }}>
          A complete parking management platform — from vehicle entry and EV charging to loyalty rewards and revenue analytics.
        </p>
      </section>

      {/* QUICK START */}
      <section style={{ padding: '0 48px 72px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#131920,#0D1117)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: 36 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#F0F4F8', marginBottom: 28 }}>⚡ Quick Start</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {QUICK_STARTS.map(({ step, title, desc }) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#2563EB', display: 'grid', placeItems: 'center', fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 800, color: 'white', flexShrink: 0 }}>{step}</div>
                <div>
                  <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F0F4F8', margin: '0 0 6px' }}>{title}</h3>
                  <p style={{ fontSize: 13, color: '#8A9BAE', margin: 0, lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE CATEGORIES */}
      {FEATURES.map(({ category, color, items }) => (
        <section key={category} style={{ padding: '0 48px 64px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
            <div style={{ width: 4, height: 28, background: color, borderRadius: 100 }} />
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color: '#F0F4F8', margin: 0 }}>{category}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)`, gap: 18 }}>
            {items.map(({ icon, title, desc, badge }) => (
              <div key={title} style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 28, transition: 'all .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${color}44`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{ width: 46, height: 46, background: `${color}18`, borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 22, color }}>{icon}</div>
                  <span style={{ fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: `${color}18`, color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{badge}</span>
                </div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 16, fontWeight: 700, color: '#F0F4F8', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#8A9BAE', lineHeight: 1.7, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* CTA */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: 'linear-gradient(135deg,#1D4ED8,#2563EB)', borderRadius: 20, padding: '56px 48px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.04) 1px,transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 30, fontWeight: 700, color: 'white', marginBottom: 12 }}>Start managing smarter today</h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', marginBottom: 28 }}>Log in with demo credentials: any email + password "password"</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'white', color: '#2563EB', padding: '12px 30px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 700 }}>Open Dashboard →</Link>
              <Link href="/help" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.12)', color: 'white', padding: '12px 24px', borderRadius: 10, textDecoration: 'none', fontSize: 14, fontWeight: 500, border: '1px solid rgba(255,255,255,0.2)' }}>Help Center</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
