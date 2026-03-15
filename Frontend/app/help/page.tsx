'use client';
import Link from 'next/link';
import { useState } from 'react';

const FAQS = [
  {
    category: '🚗 Vehicle & Sessions',
    items: [
      { q: 'How do I record a new vehicle entry?', a: 'Go to Sessions → click "+ New Entry". Enter the plate number, owner name (optional), vehicle type, and select an available spot. Optionally issue a loyalty card for new customers. Click "Record Entry" to confirm.' },
      { q: 'How do I checkout a vehicle?', a: 'In the Sessions page under "Active" tab, find the session and click "Checkout". Choose the payment method (UPI, Cash, Card). If the vehicle has a loyalty card, you can redeem points for a discount or auto-apply up to 20% off.' },
      { q: 'Can I cancel an active session?', a: 'Yes. In the Active sessions tab, click "Cancel" next to any session. This will release the spot and record the cancellation without charging the customer.' },
      { q: 'What is the demo login?', a: 'Use any email address with the password "password". This will log you in without a backend. All data will use realistic mock data so you can explore every feature.' },
    ],
  },
  {
    category: '⚡ EV Charging',
    items: [
      { q: 'How do I start an EV charging session?', a: 'Go to EV Stations, find an available station (shown in green), and click "⚡ Start". Enter the vehicle plate and optional owner name. The station status will change to "Charging" automatically.' },
      { q: 'How do I checkout an EV session?', a: 'Find the charging station (shown in cyan) and click "💳 Checkout". Select the payment method. The system will find the active session, calculate the charge, and mark the station as available.' },
      { q: 'How do I take a station offline for maintenance?', a: 'On any available station card, click the "Set Offline" button. To bring it back online, click "Set Available" on the same station.' },
    ],
  },
  {
    category: '🏆 Loyalty Program',
    items: [
      { q: 'How do I issue a loyalty card to a new customer?', a: 'You can issue a card at vehicle entry (check "Issue Loyalty Card" in the entry form), from the Loyalty page (click "+ Issue Card" and search for the vehicle), or from the Vehicles page.' },
      { q: 'What are the tier thresholds?', a: '🥉 Bronze: 0–499 points, 🥈 Silver: 500–1,499 points, 👑 Gold: 1,500+ points. Tier is automatically recalculated whenever points change.' },
      { q: 'How do customers earn points?', a: 'Customers earn 1 point for every ₹10 paid at checkout. So a ₹200 session earns 20 points. Points are awarded automatically after each successful checkout.' },
      { q: 'How does redemption work?', a: '100 points = ₹10 discount. Minimum redemption is 100 points. You can redeem manually from the Loyalty page, or during checkout by entering the number of points to redeem.' },
    ],
  },
  {
    category: '🏢 Lots & Spots',
    items: [
      { q: 'How do I create a new parking lot?', a: 'Go to Parking Lots → click "+ Create Lot". Fill in the name, location, total spots, number of floors, and default spot type. Enable "Auto-generate spots" to have ParkGrid create all spot records automatically.' },
      { q: 'How do I view all spots in a lot?', a: 'On any lot card, click "View Spots". A modal will open showing a mini grid of all spots colour-coded by status: green (free), red (occupied), yellow (reserved).' },
      { q: 'How do I record entry from a specific lot?', a: 'On the Parking Lots page, each lot card has a "+ New Entry" button that pre-filters available spots to that lot.' },
    ],
  },
  {
    category: '₹ Rates & Revenue',
    items: [
      { q: 'How are charges calculated?', a: 'Charge = max(minimum_charge, ceil(duration_hours) × rate_per_hour). The rate is looked up by vehicle type × spot type. If no rate is found for the combination, a default of ₹40/hr is applied.' },
      { q: 'How do I add a new pricing rate?', a: 'Go to Rates → click "+ Add Rate". Choose vehicle type, spot type, rate per hour, minimum charge, and effective date. Click "Save Rate". Existing rates can be edited or deleted.' },
      { q: 'Where can I see revenue reports?', a: 'The Revenue page shows monthly charts for the last 12 months, breakdown by vehicle type and payment method, plus KPIs for last month and last quarter. The Dashboard also shows today\'s revenue at a glance.' },
    ],
  },
  {
    category: '🔧 Technical',
    items: [
      { q: 'Does it work without the backend?', a: 'Yes! The frontend runs in "Demo Mode" when the backend (http://localhost:5000) is unreachable. All pages load with realistic mock data so you can evaluate and demo every feature.' },
      { q: 'How do I connect to a live backend?', a: 'Set NEXT_PUBLIC_API_URL in your .env.local file to point to your Flask backend, e.g. NEXT_PUBLIC_API_URL=http://localhost:5000. The frontend will automatically use the real API.' },
      { q: 'What database does the backend use?', a: 'The backend uses MySQL. Configure DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, and DB_NAME in the backend .env file. The default database name is parking_db.' },
    ],
  },
];

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: open ? '#F0F4F8' : '#CBD5E1', lineHeight: 1.5, transition: 'color .15s' }}>{q}</span>
        <div style={{ width: 24, height: 24, borderRadius: '50%', background: open ? 'rgba(37,99,235,0.2)' : 'rgba(255,255,255,0.06)', display: 'grid', placeItems: 'center', flexShrink: 0, transition: 'all .2s', transform: open ? 'rotate(45deg)' : 'none' }}>
          <span style={{ fontSize: 14, color: open ? '#3B82F6' : '#8A9BAE', lineHeight: 1 }}>+</span>
        </div>
      </button>
      {open && (
        <div style={{ paddingBottom: 16, paddingRight: 40 }}>
          <p style={{ fontSize: 13, color: '#8A9BAE', lineHeight: 1.75, margin: 0 }}>{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const displayed = activeCategory
    ? FAQS.filter(f => f.category === activeCategory)
    : FAQS;

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
          {[{ label: 'Home', href: '/' }, { label: 'Features', href: '/features' }, { label: 'About', href: '/about' }].map(({ label, href }) => (
            <Link key={href} href={href} style={{ fontSize: 14, color: '#8A9BAE', textDecoration: 'none', padding: '6px 14px', borderRadius: 8 }}>{label}</Link>
          ))}
          <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.1)', margin: '0 6px' }} />
          <Link href="/login" style={{ fontSize: 14, color: 'white', background: '#2563EB', padding: '8px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 20px rgba(37,99,235,0.35)' }}>Sign In →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ padding: '80px 48px 56px', maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 100, padding: '5px 16px', fontSize: 12, color: '#10B981', marginBottom: 20, fontWeight: 500 }}>
          ❓ Help Center
        </div>
        <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 18, color: '#F0F4F8' }}>How can we help?</h1>
        <p style={{ fontSize: 16, color: '#8A9BAE', maxWidth: 520, margin: '0 auto', lineHeight: 1.75, fontWeight: 300 }}>
          Everything you need to know about using ParkGrid — from recording a vehicle entry to configuring rates.
        </p>
      </section>

      {/* QUICK LINKS */}
      <section style={{ padding: '0 48px 56px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[
            { icon: '🚀', title: 'Getting Started', desc: 'Log in with any email + password "password" for demo access.', href: '/login', cta: 'Open Dashboard' },
            { icon: '🧩', title: 'Feature Guide', desc: 'Detailed breakdown of every ParkGrid feature and how to use it.', href: '/features', cta: 'View Features' },
            { icon: '💻', title: 'Backend Setup', desc: 'Running locally? Set NEXT_PUBLIC_API_URL to connect to Flask.', href: '/features#technical', cta: 'See Tech Docs' },
          ].map(({ icon, title, desc, href, cta }) => (
            <div key={title} style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 28 }}>{icon}</div>
              <div>
                <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 15, fontWeight: 700, color: '#F0F4F8', margin: '0 0 8px' }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#8A9BAE', margin: 0, lineHeight: 1.6 }}>{desc}</p>
              </div>
              <Link href={href} style={{ fontSize: 13, color: '#3B82F6', textDecoration: 'none', fontWeight: 500, marginTop: 'auto' }}>{cta} →</Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 40, alignItems: 'start' }}>

          {/* Category sidebar */}
          <div style={{ position: 'sticky', top: 80 }}>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 13, fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 14px' }}>Categories</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <button onClick={() => setActiveCategory(null)} style={{ width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: !activeCategory ? 'rgba(37,99,235,0.15)' : 'transparent', color: !activeCategory ? '#3B82F6' : '#8A9BAE', transition: 'all .15s' }}>
                All Topics
              </button>
              {FAQS.map(({ category }) => (
                <button key={category} onClick={() => setActiveCategory(activeCategory === category ? null : category)} style={{ width: '100%', textAlign: 'left', padding: '9px 14px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, background: activeCategory === category ? 'rgba(37,99,235,0.15)' : 'transparent', color: activeCategory === category ? '#3B82F6' : '#8A9BAE', transition: 'all .15s' }}>
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {displayed.map(({ category, items }) => (
              <div key={category}>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#F0F4F8', margin: '0 0 20px', paddingBottom: 14, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                  {category}
                </h2>
                <div>
                  {items.map(({ q, a }) => <AccordionItem key={q} q={q} a={a} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA */}
      <section style={{ padding: '0 48px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ background: '#0D1117', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: '#F0F4F8', margin: '0 0 6px' }}>Still have questions?</h3>
            <p style={{ fontSize: 13, color: '#8A9BAE', margin: 0 }}>Check the Features page for a full breakdown, or jump straight into the dashboard.</p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link href="/features" style={{ fontSize: 14, color: '#F0F4F8', padding: '10px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 500, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>View Features</Link>
            <Link href="/login" style={{ fontSize: 14, color: 'white', background: '#2563EB', padding: '10px 22px', borderRadius: 9, textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 18px rgba(37,99,235,0.3)' }}>Open Dashboard →</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
