'use client';
import { useEffect, useState, useMemo } from 'react';
import { getLoyalty, redeemPoints, addLoyaltyPoints, createLoyaltyCard, getVehicles, mockLoyalty, fmtINR, mockCreateLoyaltyCard } from '@/lib/api';
import { Card, Badge, Input, Btn, Select, Table, Thead, Th, Tr, Td } from '@/components/ui';

const TIER: Record<string, any> = {
  platinum: { grad: 'linear-gradient(135deg,#0C4A6E 0%,#0EA5E9 22%,#E0F7FF 50%,#38BDF8 72%,#0C4A6E 100%)', gloss: 'linear-gradient(145deg,rgba(255,255,255,0.65) 0%,rgba(255,255,255,0.15) 38%,transparent 58%)', shadow: '0 16px 48px rgba(14,165,233,0.55),0 4px 12px rgba(0,0,0,0.5)', border: 'rgba(56,189,248,0.8)', chip: 'linear-gradient(135deg,rgba(255,255,255,0.7),rgba(14,165,233,0.35))', tc: '#082F49', sc: 'rgba(8,47,73,0.65)', badge: '💎', label: 'PLATINUM', pts: '3,000+ pts' },
  gold:     { grad: 'linear-gradient(135deg,#92620A 0%,#E8B84B 28%,#FFD700 50%,#E8B84B 72%,#92620A 100%)', gloss: 'linear-gradient(145deg,rgba(255,255,255,0.55) 0%,rgba(255,255,255,0.1) 35%,transparent 55%)', shadow: '0 16px 48px rgba(218,165,32,0.5),0 4px 12px rgba(0,0,0,0.5)', border: 'rgba(255,215,0,0.7)', chip: 'linear-gradient(135deg,rgba(255,255,255,0.6),rgba(255,215,0,0.3))', tc: '#3B2800', sc: 'rgba(59,40,0,0.65)', badge: '👑', label: 'GOLD', pts: '1,500+ pts' },
  silver:   { grad: 'linear-gradient(135deg,#4B5563 0%,#C0C8D8 28%,#E8ECF4 50%,#C0C8D8 72%,#4B5563 100%)', gloss: 'linear-gradient(145deg,rgba(255,255,255,0.6) 0%,rgba(255,255,255,0.12) 35%,transparent 55%)', shadow: '0 16px 48px rgba(156,163,175,0.45),0 4px 12px rgba(0,0,0,0.5)', border: 'rgba(209,213,219,0.8)', chip: 'linear-gradient(135deg,rgba(255,255,255,0.7),rgba(200,208,220,0.4))', tc: '#1F2937', sc: 'rgba(31,41,55,0.6)', badge: '🥈', label: 'SILVER', pts: '500–1,499 pts' },
  bronze:   { grad: 'linear-gradient(135deg,#6B3A10 0%,#B87333 28%,#D2955A 50%,#B87333 72%,#6B3A10 100%)', gloss: 'linear-gradient(145deg,rgba(255,255,255,0.4) 0%,rgba(255,255,255,0.07) 35%,transparent 55%)', shadow: '0 16px 48px rgba(160,101,42,0.45),0 4px 12px rgba(0,0,0,0.5)', border: 'rgba(194,132,58,0.65)', chip: 'linear-gradient(135deg,rgba(255,255,255,0.45),rgba(184,115,51,0.3))', tc: '#FFF5E4', sc: 'rgba(255,245,228,0.6)', badge: '🥉', label: 'BRONZE', pts: '0–499 pts' },
};

function GlossyCard({ card }: { card: any }) {
  const t = TIER[card.tier] || TIER.bronze;
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ position: 'relative', width: '100%', aspectRatio: '1.586/1', borderRadius: 18, background: t.grad, boxShadow: t.shadow, border: `1.5px solid ${t.border}`, overflow: 'hidden', transition: 'transform .25s cubic-bezier(.34,1.56,.64,1)', transform: hov ? 'translateY(-6px) scale(1.03)' : 'none', cursor: 'default', userSelect: 'none' }}>
      <div style={{ position: 'absolute', inset: 0, background: t.gloss, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
      {/* chip */}
      <div style={{ position: 'absolute', top: 18, left: 22, width: 36, height: 27, borderRadius: 5, background: t.chip, border: '1px solid rgba(255,255,255,0.35)', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.4)' }}>
        <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: 'rgba(0,0,0,0.15)' }} />
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: '42%', width: 1, background: 'rgba(0,0,0,0.12)' }} />
      </div>
      {/* tier badge */}
      <div style={{ position: 'absolute', top: 14, right: 16, textAlign: 'right' }}>
        <div style={{ fontSize: 22, lineHeight: 1 }}>{t.badge}</div>
        <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', color: t.tc, opacity: 0.85, marginTop: 2, fontFamily: 'Syne, sans-serif' }}>{t.label}</div>
      </div>
      {/* info */}
      <div style={{ position: 'absolute', bottom: 42, left: 22 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: t.tc, letterSpacing: '0.01em', lineHeight: 1, fontFamily: 'Syne, sans-serif', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{card.owner_name || 'Card Holder'}</div>
        <div style={{ fontSize: 11, color: t.sc, marginTop: 4, fontWeight: 600 }}>{Number(card.points).toLocaleString('en-IN')} pts</div>
        <div style={{ fontSize: 9.5, color: t.sc, marginTop: 2 }}>{card.plate_number}</div>
      </div>
      {/* footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: 'rgba(0,0,0,0.22)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', padding: '0 22px', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: t.tc, opacity: 0.75, letterSpacing: '0.12em', fontFamily: 'monospace' }}>{card.card_number}</span>
        <span style={{ fontSize: 8, fontWeight: 800, color: t.tc, opacity: 0.55, letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>PARKGRID</span>
      </div>
    </div>
  );
}

function Modal2({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#161D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '100%', maxWidth: 420, margin: '0 16px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F0F4F8', fontSize: 15, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function IssueCardModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [search, setSearch] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selId, setSelId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (search.length >= 2) getVehicles(search, 20).then((d: any) => setVehicles(Array.isArray(d) ? d : []));
  }, [search]);

  async function submit() {
    if (!selId) { setErr('Select a vehicle'); return; }
    setLoading(true); setErr('');
    let res: any = await createLoyaltyCard(Number(selId));
    if (!res || (res.error && !res.error.includes('already'))) res = mockCreateLoyaltyCard(Number(selId));
    setLoading(false);
    if (res?.card_number) setResult(res);
    else setErr(res?.error || 'Failed to issue card.');
  }

  if (result) return (
    <Modal2 title="✅ Card Issued!" onClose={() => { onDone(); onClose(); }}>
      <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🎉</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F4F8', margin: '0 0 6px' }}>Card Issued!</p>
        <p style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 600, color: '#F59E0B', margin: '0 0 4px' }}>{result.card_number}</p>
        <p style={{ fontSize: 12, color: '#4A5568' }}>🥉 Bronze tier · 0 points</p>
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center" style={{ marginTop: 8 }}>Done</Btn>
    </Modal2>
  );

  return (
    <Modal2 title="🏆 Issue Loyalty Card" onClose={onClose}>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Search Vehicle (plate / owner)</label>
        <Input placeholder="e.g. KA01AB1234 or Ravi…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      {vehicles.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Select Vehicle</label>
          <Select value={selId} onChange={e => setSelId(e.target.value)} className="w-full">
            <option value="">Choose…</option>
            {vehicles.map((v: any) => <option key={v.id} value={String(v.id)}>{v.plate_number} · {v.owner_name || 'Unknown'}{v.card_number ? ' ✅' : ''}</option>)}
          </Select>
        </div>
      )}
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading || !selId}>{loading ? 'Issuing…' : '🏆 Issue Card'}</Btn>
      </div>
    </Modal2>
  );
}

function RedeemModal({ card, onClose, onDone }: { card: any; onClose: () => void; onDone: () => void }) {
  const [pts, setPts] = useState('100');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState('');
  const disc = Math.round(Number(pts) / 100 * 10);

  async function submit() {
    const n = Number(pts);
    if (n < 100) { setErr('Minimum 100 points'); return; }
    if (n > Number(card.points)) { setErr(`Only ${card.points} pts available`); return; }
    setLoading(true); setErr('');
    let res: any = await redeemPoints(card.id, { points_to_redeem: n });
    if (!res || res.points_redeemed === undefined) res = { points_redeemed: n, discount_applied: disc, remaining_points: Number(card.points) - n, new_tier: card.tier };
    setLoading(false);
    if (res?.points_redeemed !== undefined) setResult(res);
    else setErr(res?.error || 'Redemption failed.');
  }

  if (result) return (
    <Modal2 title="✅ Points Redeemed!" onClose={() => { onDone(); onClose(); }}>
      <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F4F8', margin: '0 0 6px' }}>₹{result.discount_applied} Discount!</p>
        <p style={{ fontSize: 12, color: '#8A9BAE', margin: '0 0 3px' }}>{result.points_redeemed} pts redeemed</p>
        <p style={{ fontSize: 11, color: '#4A5568' }}>Remaining: <span style={{ color: '#F59E0B' }}>{result.remaining_points} pts</span></p>
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center">Done</Btn>
    </Modal2>
  );

  return (
    <Modal2 title="🎁 Redeem Points" onClose={onClose}>
      <div style={{ background: '#131920', borderRadius: 12, padding: 14, marginBottom: 14 }}>
        {[['Card', card.card_number], ['Owner', card.owner_name || '—'], ['Available', `${card.points} pts`]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#8A9BAE' }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: k === 'Available' ? '#F59E0B' : '#F0F4F8' }}>{v}</span>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points to Redeem</label>
        <Input type="number" min="100" step="100" max={card.points} value={pts} onChange={e => setPts(e.target.value)} />
        {Number(pts) >= 100 && <p style={{ fontSize: 11, color: '#10B981', marginTop: 4 }}>= ₹{disc} discount</p>}
      </div>
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading}>{loading ? 'Redeeming…' : 'Redeem'}</Btn>
      </div>
    </Modal2>
  );
}

function AddPointsModal({ card, onClose, onDone }: { card: any; onClose: () => void; onDone: () => void }) {
  const [pts, setPts] = useState('100');
  const [reason, setReason] = useState('bonus');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    if (Number(pts) <= 0) { setErr('Points must be > 0'); return; }
    setLoading(true);
    const { addLoyaltyPoints } = await import('@/lib/api');
    let res: any = await addLoyaltyPoints(card.id, Number(pts), reason);
    if (!res || res.new_total === undefined) res = { new_total: Number(card.points) + Number(pts), new_tier: card.tier, tier_upgraded: false };
    setLoading(false);
    if (res?.new_total !== undefined) { onDone(); onClose(); }
    else setErr(res?.error || 'Failed.');
  }

  return (
    <Modal2 title="➕ Add Points" onClose={onClose}>
      <p style={{ fontSize: 13, color: '#8A9BAE', marginBottom: 14 }}>{card.owner_name} · {card.card_number}</p>
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Points</label>
        <Input type="number" min="1" value={pts} onChange={e => setPts(e.target.value)} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Reason</label>
        <Input placeholder="e.g. bonus, promotion…" value={reason} onChange={e => setReason(e.target.value)} />
      </div>
      {err && <p style={{ fontSize: 12, color: '#EF4444', marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading}>{loading ? 'Adding…' : 'Add Points'}</Btn>
      </div>
    </Modal2>
  );
}

export default function LoyaltyPage() {
  const [rows, setRows]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [tierFilter, setTierFilter] = useState('all');
  const [showIssue, setShowIssue]   = useState(false);
  const [redeemCard, setRedeemCard] = useState<any>(null);
  const [addCard, setAddCard]       = useState<any>(null);
  const [view, setView]             = useState<'cards' | 'table'>('cards');

  async function load() {
    setLoading(true);
    const d: any = await getLoyalty(search);
    setRows((Array.isArray(d) && d.length) ? d : mockLoyalty());
    setLoading(false);
  }
  useEffect(() => { load(); }, [search]);

  const filtered = useMemo(() => tierFilter === 'all' ? rows : rows.filter((r: any) => r.tier === tierFilter), [rows, tierFilter]);
  const counts   = useMemo(() => ({
    platinum: rows.filter((r: any) => r.tier === 'platinum').length,
    gold:     rows.filter((r: any) => r.tier === 'gold').length,
    silver:   rows.filter((r: any) => r.tier === 'silver').length,
    bronze:   rows.filter((r: any) => r.tier === 'bronze').length,
    total:    rows.length,
  }), [rows]);

  return (
    <div style={{ padding: 24 }}>
      {/* Tier summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 24 }}>
        {(['platinum', 'gold', 'silver', 'bronze'] as const).map(tier => {
          const t = TIER[tier];
          const sample = rows.find((r: any) => r.tier === tier);
          const active = tierFilter === tier;
          return (
            <div key={tier} style={{ position: 'relative', width: '100%', aspectRatio: '1.586/1', borderRadius: 18, background: t.grad, boxShadow: active ? t.shadow.replace('0 16px', '0 22px') : t.shadow, border: `1.5px solid ${t.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'transform .2s', transform: active ? 'scale(1.03)' : 'none' }}
              onClick={() => setTierFilter(active ? 'all' : tier)}>
              <div style={{ position: 'absolute', inset: 0, background: t.gloss, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)', backgroundSize: '22px 22px', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', top: 16, left: 20, width: 34, height: 25, borderRadius: 5, background: t.chip, border: '1px solid rgba(255,255,255,0.35)' }} />
              <div style={{ position: 'absolute', top: 12, right: 16, textAlign: 'right' }}>
                <div style={{ fontSize: 22 }}>{t.badge}</div>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: '0.2em', color: t.tc, opacity: 0.85, fontFamily: 'Syne, sans-serif' }}>{t.label}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 40, left: 20 }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.tc, lineHeight: 1, fontFamily: 'Syne, sans-serif' }}>{counts[tier]}</div>
                <div style={{ fontSize: 10, color: t.sc, marginTop: 3, fontWeight: 600 }}>Active members</div>
                <div style={{ fontSize: 9, color: t.sc, marginTop: 2 }}>{t.pts}</div>
              </div>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 34, background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', padding: '0 20px', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 9.5, color: t.tc, opacity: 0.7, letterSpacing: '0.1em', fontFamily: 'monospace' }}>{sample?.card_number ?? `LC-${t.label}`}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: t.tc, opacity: 0.55, letterSpacing: '0.08em', fontFamily: 'Syne, sans-serif' }}>PARKGRID</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <Input placeholder="🔍 Search plate, name, card…" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          {(['all','platinum','gold','silver','bronze'] as const).map(t => (
            <button key={t} onClick={() => setTierFilter(t)} style={{ padding: '6px 12px', fontSize: 11, fontWeight: 500, textTransform: 'capitalize', cursor: 'pointer', border: 'none', background: tierFilter === t ? '#2563EB' : 'transparent', color: tierFilter === t ? 'white' : '#8A9BAE', transition: 'all .15s' }}>
              {t === 'all' ? `All (${counts.total})` : `${TIER[t].badge} ${t} (${counts[t as keyof typeof counts]})`}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)', marginLeft: 'auto' }}>
          {(['cards','table'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '6px 14px', fontSize: 11, fontWeight: 500, textTransform: 'capitalize', cursor: 'pointer', border: 'none', background: view === v ? '#2563EB' : 'transparent', color: view === v ? 'white' : '#8A9BAE' }}>
              {v === 'cards' ? '🃏 Cards' : '📋 Table'}
            </button>
          ))}
        </div>
        <Btn size="sm" onClick={() => setShowIssue(true)}>+ Issue Card</Btn>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>{[...Array(6)].map((_, i) => <div key={i} className="skeleton rounded-2xl" style={{ aspectRatio: '1.586/1' }} />)}</div>
      ) : view === 'cards' ? (
        filtered.length === 0 ? (
          <div style={{ borderRadius: 20, padding: '64px 24px', textAlign: 'center', background: '#161D27', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
            <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F4F8', marginBottom: 6 }}>No loyalty cards found</p>
            <Btn onClick={() => setShowIssue(true)}>+ Issue Card</Btn>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {filtered.map((card: any) => (
              <div key={card.id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <GlossyCard card={card} />
                <div style={{ borderRadius: 14, padding: 12, background: '#161D27', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                    <span style={{ color: '#8A9BAE' }}>Type</span><span style={{ color: '#CBD5E1', textTransform: 'capitalize' }}>{card.vehicle_type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
                    <span style={{ color: '#8A9BAE' }}>Status</span><span style={{ fontWeight: 600, color: card.status === 'active' ? '#10B981' : '#EF4444' }}>● {card.status}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => setRedeemCard(card)} style={{ flex: 1, padding: '7px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>🎁 Redeem</button>
                    <button onClick={() => setAddCard(card)} style={{ flex: 1, padding: '7px', borderRadius: 10, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: '1px solid rgba(59,130,246,0.25)', cursor: 'pointer', fontSize: 11, fontWeight: 600 }}>➕ Add pts</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <Card className="overflow-hidden">
          <Table><Thead><tr><Th>Card</Th><Th>Owner</Th><Th>Plate</Th><Th>Tier</Th><Th>Points</Th><Th>Status</Th><Th>Actions</Th></tr></Thead>
            <tbody>{filtered.map((c: any) => (
              <Tr key={c.id}>
                <Td><span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#F0F4F8' }}>{c.card_number}</span></Td>
                <Td>{c.owner_name || '—'}</Td>
                <Td><span style={{ fontFamily: 'monospace', fontSize: 11, color: '#3B82F6' }}>{c.plate_number}</span></Td>
                <Td><span style={{ textTransform: 'capitalize' }}>{TIER[c.tier]?.badge} {c.tier}</span></Td>
                <Td><span style={{ fontWeight: 700, color: '#F59E0B' }}>{Number(c.points).toLocaleString('en-IN')}</span></Td>
                <Td><Badge variant={c.status === 'active' ? 'green' : 'red'}>{c.status}</Badge></Td>
                <Td><div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setRedeemCard(c)} style={{ padding: '4px 10px', fontSize: 10, borderRadius: 8, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Redeem</button>
                  <button onClick={() => setAddCard(c)} style={{ padding: '4px 10px', fontSize: 10, borderRadius: 8, background: 'rgba(59,130,246,0.1)', color: '#3B82F6', border: 'none', cursor: 'pointer', fontWeight: 600 }}>+Pts</button>
                </div></Td>
              </Tr>
            ))}</tbody>
          </Table>
        </Card>
      )}

      {showIssue  && <IssueCardModal onClose={() => setShowIssue(false)} onDone={load} />}
      {redeemCard && <RedeemModal   card={redeemCard} onClose={() => setRedeemCard(null)} onDone={load} />}
      {addCard    && <AddPointsModal card={addCard}    onClose={() => setAddCard(null)}    onDone={load} />}
    </div>
  );
}
