'use client';
import { useEffect, useState } from 'react';
import {
  getDashboardOverview, getOccupancyMap, getMonthlyRevenue,
  getActiveSessions, getLots, getLoyaltyLeaderboard, getEVStations,
  getSessions,
  mockOverview, mockSpots, mockRevenue, mockSessions, mockLots, mockLoyalty, mockEV,
  fmtINR, fmtDuration, fmtDate,
} from '@/lib/api';
import { Card, KpiCard, SectionHead, LiveDot, Badge, Skeleton } from '@/components/ui';
import ParkingGrid, { GridLegend } from '@/components/dashboard/ParkingGrid';
import RevenueChart from '@/components/dashboard/RevenueChart';
import Link from 'next/link';

// ── Quick Action Button ──────────────────────────────────────────────────
function QAction({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        padding: '16px 12px', borderRadius: 14, cursor: 'pointer',
        background: `${color}0f`, border: `1px solid ${color}22`,
        transition: 'all .18s',
      }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = `${color}1e`; (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = `${color}0f`; (e.currentTarget as HTMLDivElement).style.transform = ''; }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: `${color}22`, display: 'grid', placeItems: 'center', fontSize: 18 }}>{icon}</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#8A9BAE', textAlign: 'center', lineHeight: 1.3 }}>{label}</span>
      </div>
    </Link>
  );
}

// ── EV Station Mini Card ─────────────────────────────────────────────────
function EVMini({ station }: { station: any }) {
  const isCharging = station.status === 'charging';
  const isOffline  = station.status === 'offline';
  const color      = isCharging ? '#06B6D4' : isOffline ? '#EF4444' : '#10B981';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 12, background: `${color}0c`, border: `1px solid ${color}22` }}>
      <span style={{ fontSize: 18, flexShrink: 0 }}>{isCharging ? '⚡' : isOffline ? '🔴' : '🔌'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#F0F4F8', margin: 0 }}>{station.spot_number}</p>
        <p style={{ fontSize: 10, color: '#4A5568', margin: 0 }}>{station.lot_name} · {station.power_kw ?? 7.2} kW</p>
      </div>
      <span style={{ fontSize: 10, fontWeight: 700, color, padding: '2px 8px', borderRadius: 6, background: `${color}18`, textTransform: 'capitalize', flexShrink: 0 }}>
        {station.status}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [ov,         setOv]         = useState<any>(null);
  const [spots,      setSpots]      = useState<any[]>([]);
  const [rev,        setRev]        = useState<any[]>([]);
  const [active,     setActive]     = useState<any[]>([]);
  const [lots,       setLots]       = useState<any[]>([]);
  const [leaderboard,setLeaderboard]= useState<any[]>([]);
  const [evStations, setEvStations] = useState<any[]>([]);
  const [recent,     setRecent]     = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    async function load() {
      const [o, sp, rv, ac, lt, lb, ev, rs] = await Promise.all([
        getDashboardOverview(), getOccupancyMap(), getMonthlyRevenue(),
        getActiveSessions(), getLots(), getLoyaltyLeaderboard(),
        getEVStations(), getSessions('closed', 5),
      ]);
      setOv((o && !(o as any).error) ? o : mockOverview());
      setSpots((Array.isArray(sp) && sp.length) ? sp as any[] : mockSpots());
      setRev((Array.isArray(rv) && rv.length) ? rv as any[] : mockRevenue());
      setActive((Array.isArray(ac) && ac.length) ? (ac as any[]).slice(0, 10) : mockSessions().filter((s: any) => !s.exit_time).slice(0, 10));
      setLots((Array.isArray(lt) && lt.length) ? lt as any[] : mockLots());
      setLeaderboard((Array.isArray(lb) && lb.length) ? (lb as any[]).slice(0, 5) : mockLoyalty().filter((c: any) => c.status === 'active').sort((a: any, b: any) => b.points - a.points).slice(0, 5));
      setEvStations((Array.isArray(ev) && ev.length) ? ev as any[] : mockEV());
      setRecent((Array.isArray(rs) && rs.length) ? (rs as any[]).slice(0, 6) : mockSessions().filter((s: any) => s.exit_time).slice(0, 6));
      setLoading(false);
    }
    load();
  }, []);

  const occ     = ov ? Math.round((ov.spots_occupied / Math.max(ov.spots_total, 1)) * 100) : 0;
  const evPct   = ov ? Math.round((ov.ev_charging / Math.max(ov.ev_total, 1)) * 100) : 0;
  const rev12   = rev.slice(-12);
  const growth  = rev12.length >= 2
    ? Math.round(((rev12[rev12.length-1]?.revenue - rev12[rev12.length-2]?.revenue) / Math.max(rev12[rev12.length-2]?.revenue || 1, 1)) * 100)
    : 0;

  const kpis = [
    { icon: '🅿️', iconBg: 'bg-[rgba(37,99,235,0.15)]',  iconColor: '#3B82F6', label: 'Spots Occupied',      value: loading ? '…' : `${ov?.spots_occupied}/${ov?.spots_total}`, badge: `${occ}%`,    badgeVariant: 'blue'   as const, barWidth: occ,   barColor: '#2563EB' },
    { icon: '₹',  iconBg: 'bg-[rgba(16,185,129,0.12)]', iconColor: '#10B981', label: "Today's Revenue",     value: loading ? '…' : fmtINR(ov?.today_revenue),                  badge: 'Today',      badgeVariant: 'green'  as const, barWidth: 70,    barColor: '#10B981' },
    { icon: '⚡', iconBg: 'bg-[rgba(6,182,212,0.12)]',  iconColor: '#06B6D4', label: 'EV Charging',         value: loading ? '…' : `${ov?.ev_charging}/${ov?.ev_total}`,        badge: `${evPct}%`,  badgeVariant: 'cyan'   as const, barWidth: evPct, barColor: '#06B6D4' },
    { icon: '🏆', iconBg: 'bg-[rgba(245,158,11,0.12)]', iconColor: '#F59E0B', label: 'Active Loyalty Cards', value: loading ? '…' : String(ov?.loyalty_active ?? 0),            badge: 'Members',    badgeVariant: 'yellow' as const, barWidth: 75,    barColor: '#F59E0B' },
  ];

  const TIER_CFG: Record<string, { badge: string; color: string }> = {
    gold:     { badge: '👑', color: '#F59E0B' },
    silver:   { badge: '🥈', color: '#9CA3AF' },
    bronze:   { badge: '🥉', color: '#B87333' },
    platinum: { badge: '💎', color: '#06B6D4' },
  };

  const chargingNow = evStations.filter((s: any) => s.status === 'charging');
  const evAvail     = evStations.filter((s: any) => s.status === 'available');

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* ── ROW 1: KPIs ──────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />) : kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* ── ROW 2: Slot Grid + Active Sessions ───────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 290px', gap: 14 }}>
        <Card className="p-5">
          <SectionHead title="Live Slot Grid" sub="First 60 spots — hover for details" right={<LiveDot />} />
          <div style={{ marginBottom: 10 }}><GridLegend /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.1em' }}>🚗 Entrance</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          {loading ? <Skeleton className="h-44" /> : <ParkingGrid spots={spots.slice(0, 60)} cols={15} />}
        </Card>

        <Card className="overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <SectionHead title="Active Sessions" sub={`${active.length} parked`} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', maxHeight: 300 }}>
            {active.length === 0 ? (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#4A5568', fontSize: 12 }}>No active sessions</div>
            ) : active.map((s: any, idx: number) => (
              <div key={s.id ?? idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 14, background: s.spot_type === 'ev' ? 'rgba(6,182,212,0.15)' : 'rgba(239,68,68,0.12)', flexShrink: 0 }}>
                  {s.spot_type === 'ev' ? '⚡' : '🚗'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: '#F0F4F8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.plate_number}</p>
                  <p style={{ fontSize: 10, color: '#4A5568', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.owner_name || '—'} · {s.lot_name}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: s.spot_type === 'ev' ? '#06B6D4' : '#F59E0B', margin: 0 }}>{fmtDuration(s.elapsed_mins)}</p>
                  <span style={{ fontSize: 10, padding: '1px 5px', borderRadius: 4, background: 'rgba(37,99,235,0.12)', color: '#3B82F6', fontFamily: 'monospace', fontWeight: 700 }}>{s.spot_number}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ── ROW 3: Quick Actions ─────────────────────────────── */}
      <Card className="p-5">
        <SectionHead title="Quick Actions" sub="Jump to common tasks" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10 }}>
          {[
            { icon: '🚗', label: 'New Entry',     href: '/dashboard/sessions', color: '#3B82F6' },
            { icon: '💳', label: 'Checkout',      href: '/dashboard/sessions', color: '#10B981' },
            { icon: '⚡', label: 'EV Charging',   href: '/dashboard/ev',       color: '#06B6D4' },
            { icon: '🏢', label: 'Manage Lots',   href: '/dashboard/lots',     color: '#8B5CF6' },
            { icon: '🏆', label: 'Loyalty Cards', href: '/dashboard/loyalty',  color: '#F59E0B' },
            { icon: '⊡', label: 'Slot Grid',      href: '/dashboard/grid',     color: '#EF4444' },
            { icon: '₹', label: 'Set Rates',      href: '/dashboard/rates',    color: '#10B981' },
            { icon: '📈', label: 'Revenue',        href: '/dashboard/revenue',  color: '#3B82F6' },
          ].map(a => <QAction key={a.label} {...a} />)}
        </div>
      </Card>

      {/* ── ROW 4: Revenue Chart + Lot Occupancy ─────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start' }}>
        {/* Fixed-height revenue card — never stretches */}
        <Card className="p-5" style={{ height: 360 }}>
          <SectionHead title="Monthly Revenue" sub="Last 12 months" right={<Badge variant={growth >= 0 ? 'green' : 'red'}>{growth >= 0 ? '+' : ''}{growth}%</Badge>} />
          {loading ? <Skeleton className="h-[272px]" /> : <RevenueChart data={rev} height={272} />}
        </Card>
        {/* Capped-height lot occupancy — scrolls internally */}
        <Card style={{ overflow: 'hidden', maxHeight: 360 }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 14, fontWeight: 700, color: '#F0F4F8', marginBottom: 2 }}>Lot Occupancy</div>
            <div style={{ fontSize: 11, color: '#4A5568' }}>All lots · scroll to see more</div>
          </div>
          <div style={{ overflowY: 'auto', padding: '10px 20px 14px', maxHeight: 296 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {lots.map((l: any, idx: number) => {
                const pct   = Number(l.occupancy_pct) || Math.round(((Number(l.occupied_spots) || 0) / Math.max(Number(l.total_spots) || 1, 1)) * 100);
                const color = pct > 80 ? '#EF4444' : pct > 50 ? '#F59E0B' : '#10B981';
                return (
                  <div key={l.id ?? idx}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
                      <div style={{ minWidth: 0, flex: 1, paddingRight: 8 }}>
                        <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, fontSize: 12, color: '#F0F4F8' }}>{l.name}</span>
                        <span style={{ fontSize: 10, color: '#4A5568', marginLeft: 6 }}>{l.location}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 12, color, flexShrink: 0 }}>{pct}%</span>
                    </div>
                    <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden', marginBottom: 4 }}>
                      <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg,${color}70,${color})`, borderRadius: 100, transition: 'width 1s ease' }} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 10, color: '#EF4444' }}>● {Number(l.occupied_spots) || 0} occ</span>
                      <span style={{ fontSize: 10, color: '#10B981' }}>● {Number(l.available_spots) || 0} free</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      </div>


      {/* ── ROW 5: Loyalty Leaderboard + EV Status + Recent Sessions ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>

        {/* Loyalty Leaderboard */}
        <Card className="overflow-hidden">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionHead title="🏆 Top Members" sub="By loyalty points" />
            <Link href="/dashboard/loyalty" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>View all →</Link>
          </div>
          <div>
            {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton mx-4 my-2" style={{ height: 40, borderRadius: 8 }} />) :
            leaderboard.map((c: any, idx: number) => {
              const tier = TIER_CFG[c.tier] || TIER_CFG.bronze;
              return (
                <div key={c.id ?? idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                  <span style={{ fontSize: 16, fontWeight: 800, color: idx === 0 ? '#F59E0B' : idx === 1 ? '#9CA3AF' : '#8A9BAE', width: 20, flexShrink: 0, fontFamily: 'Syne, sans-serif' }}>
                    #{idx + 1}
                  </span>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{tier.badge}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 600, color: '#F0F4F8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.owner_name || '—'}</p>
                    <p style={{ fontSize: 10, color: '#4A5568', margin: 0, fontFamily: 'monospace' }}>{c.plate_number}</p>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: tier.color, flexShrink: 0 }}>
                    {Number(c.points).toLocaleString('en-IN')} pts
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* EV Station Status */}
        <Card className="overflow-hidden">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionHead title="⚡ EV Stations" sub={`${chargingNow.length} charging · ${evAvail.length} free`} />
            <Link href="/dashboard/ev" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>Manage →</Link>
          </div>
          {/* Summary pills */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            {[
              { label: 'Charging', val: chargingNow.length,  color: '#06B6D4' },
              { label: 'Available', val: evAvail.length,     color: '#10B981' },
              { label: 'Offline',  val: evStations.filter((s: any) => s.status === 'offline').length, color: '#EF4444' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ flex: 1, textAlign: 'center', padding: '8px 4px', borderRadius: 10, background: `${color}10`, border: `1px solid ${color}22` }}>
                <div style={{ fontSize: 18, fontWeight: 700, color, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{val}</div>
                <div style={{ fontSize: 9, color: '#4A5568', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '10px 14px', overflowY: 'auto', maxHeight: 200 }}>
            {loading ? [...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 36, borderRadius: 10 }} />) :
            evStations.slice(0, 8).map((s: any, i: number) => <EVMini key={s.id ?? i} station={s} />)}
          </div>
        </Card>

        {/* Recent Checkouts */}
        <Card className="overflow-hidden">
          <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <SectionHead title="✅ Recent Checkouts" sub="Last paid sessions" />
            <Link href="/dashboard/sessions" style={{ fontSize: 11, color: '#3B82F6', textDecoration: 'none', fontWeight: 500 }}>All →</Link>
          </div>
          <div>
            {loading ? [...Array(5)].map((_, i) => <div key={i} className="skeleton mx-4 my-2" style={{ height: 40, borderRadius: 8 }} />) :
            recent.map((s: any, idx: number) => (
              <div key={s.id ?? idx} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, display: 'grid', placeItems: 'center', fontSize: 14, background: 'rgba(16,185,129,0.12)', flexShrink: 0 }}>✅</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Syne, sans-serif', fontSize: 12, fontWeight: 700, color: '#F0F4F8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.plate_number}</p>
                  <p style={{ fontSize: 10, color: '#4A5568', margin: 0 }}>{s.spot_number} · {fmtDuration(s.duration_mins)}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{fmtINR(s.amount_charged)}</div>
                  <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'capitalize' }}>{s.payment_method || '—'}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

    </div>
  );
}
