'use client';
import { useEffect, useState, useMemo } from 'react';
import {
  getSessions, vehicleEntry, checkout, cancelSession, redeemPoints,
  getSpots, createLoyaltyCard,
  mockSessions, mockSpots, mockVehicleEntry, mockCreateLoyaltyCard, mockCheckout,
  fmtINR, fmtDate, fmtDuration,
} from '@/lib/api';
import { Card, Badge, Table, Thead, Th, Tr, Td, Input, Btn, Select } from '@/components/ui';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#161D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '100%', maxWidth: 440, margin: '0 16px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#161D27', zIndex: 10 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F0F4F8', fontSize: 15, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</label>
      {children}
    </div>
  );
}

/* ── Entry Modal ─────────────────────────────────────────────────────────── */
function EntryModal({ onClose, onDone }: { onClose: () => void; onDone: () => void }) {
  const [spots, setSpots]   = useState<any[]>([]);
  const [plate, setPlate]   = useState('');
  const [owner, setOwner]   = useState('');
  const [vtype, setVtype]   = useState('car');
  const [spotId, setSpotId] = useState('');
  const [wantCard, setWantCard] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [step, setStep]         = useState<'form' | 'success'>('form');
  const [result, setResult]     = useState<any>(null);
  const [err, setErr]           = useState('');

  useEffect(() => {
    getSpots({ status: 'available' }).then((d: any) => {
      const list = (d && !d.error && Array.isArray(d)) ? d : mockSpots().filter((s: any) => s.status === 'available');
      setSpots(list);
      if (list.length > 0) setSpotId(String(list[0].id));
    });
  }, []);

  async function submit() {
    if (!plate.trim()) { setErr('Plate number required'); return; }
    if (!spotId) { setErr('Select a parking spot'); return; }
    setLoading(true); setErr('');
    let res: any = await vehicleEntry({ plate_number: plate.toUpperCase(), spot_id: Number(spotId), vehicle_type: vtype, owner_name: owner });
    if (!res || !res.session_id) res = mockVehicleEntry({ plate_number: plate, spot_id: Number(spotId) });
    if (res?.error) { setErr(res.error); setLoading(false); return; }
    let cardInfo = null;
    if (wantCard && res?.vehicle_id) {
      let card: any = await createLoyaltyCard(res.vehicle_id);
      if (!card || card.error?.includes('already')) cardInfo = null;
      else if (!card || card.error) card = mockCreateLoyaltyCard(res.vehicle_id);
      if (card?.card_number) cardInfo = card;
    }
    setLoading(false);
    setResult({ ...res, cardInfo });
    setStep('success');
  }

  const sel = spots.find((s: any) => String(s.id) === spotId);

  if (step === 'success') return (
    <Modal title="✅ Entry Recorded" onClose={() => { onDone(); onClose(); }}>
      <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
        <div style={{ fontSize: 48 }}>🚗</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F0F4F8', margin: '10px 0 4px' }}>{plate.toUpperCase()}</p>
        <p style={{ fontSize: 13, color: '#8A9BAE' }}>Session #{result?.session_id} · {sel?.spot_number || spotId}</p>
        {result?.cardInfo && (
          <div style={{ marginTop: 12, display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.3)' }}>
            <span>🏆</span>
            <span style={{ color: '#F59E0B', fontWeight: 600, fontSize: 13 }}>Card: {result.cardInfo.card_number}</span>
          </div>
        )}
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center">Done</Btn>
    </Modal>
  );

  return (
    <Modal title="🚗 Vehicle Entry" onClose={onClose}>
      <Field label="Plate Number *"><Input placeholder="KA01AB1234" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} /></Field>
      <Field label="Owner Name"><Input placeholder="Full name (optional)" value={owner} onChange={e => setOwner(e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Vehicle Type">
          <Select value={vtype} onChange={e => setVtype(e.target.value)} className="w-full">
            <option value="car">🚗 Car</option>
            <option value="motorcycle">🏍️ Motorcycle</option>
            <option value="truck">🚛 Truck</option>
            <option value="ev">⚡ EV</option>
          </Select>
        </Field>
        <Field label="Spot *">
          <Select value={spotId} onChange={e => setSpotId(e.target.value)} className="w-full">
            <option value="">Select…</option>
            {spots.slice(0, 100).map((s: any) => (
              <option key={s.id} value={String(s.id)}>{s.spot_number} · {s.lot_name}</option>
            ))}
          </Select>
        </Field>
      </div>
      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, cursor: 'pointer', padding: '12px 14px', borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
        <input type="checkbox" checked={wantCard} onChange={e => setWantCard(e.target.checked)} style={{ width: 16, height: 16, marginTop: 2, accentColor: '#F59E0B', flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600, margin: '0 0 3px' }}>Issue Loyalty Card (new customer)</p>
          <p style={{ fontSize: 11, color: '#8A9BAE', margin: 0 }}>Earn points from this session · starts at 🥉 Bronze</p>
        </div>
      </label>
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading}>{loading ? 'Recording…' : 'Record Entry'}</Btn>
      </div>
    </Modal>
  );
}

/* ── Checkout Modal ──────────────────────────────────────────────────────── */
function CheckoutModal({ session, onClose, onDone }: { session: any; onClose: () => void; onDone: () => void }) {
  const [method, setMethod]     = useState('upi');
  const [redeemPts, setRedeemPts] = useState('');
  const [applyDisc, setApplyDisc] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [err, setErr]           = useState('');
  const pts = Number(redeemPts) || 0;
  const ptDiscount = Math.floor(pts / 100) * 10;

  async function handleCheckout() {
    setLoading(true); setErr('');

    // Redeem points first if requested
    if (pts >= 100 && session.loyalty_card_id) {
      const rd: any = await redeemPoints(session.loyalty_card_id, { points_to_redeem: pts, session_id: session.id });
      if (rd?.error) { setErr(rd.error); setLoading(false); return; }
    }

    // Checkout
    let res: any = await checkout(session.id, { payment_method: method, apply_loyalty_discount: applyDisc });

    // Demo fallback — if backend unreachable, simulate locally
    if (!res || res.amount_charged === undefined) {
      res = mockCheckout(session, { method, redeemPts: pts });
    }

    setLoading(false);
    if (res?.amount_charged !== undefined) setResult(res);
    else setErr(res?.error || 'Checkout failed. Make sure backend is running.');
  }

  if (result) return (
    <Modal title="✅ Checkout Complete" onClose={() => { onDone(); onClose(); }}>
      <div style={{ marginBottom: 20 }}>
        {[
          ['Vehicle',          session.plate_number],
          ['Spot',             `${session.spot_number} · ${session.lot_name}`],
          ['Duration',         fmtDuration(result.duration_mins)],
          ['Subtotal',         fmtINR(result.original_amount)],
          ...(result.loyalty_discount > 0 ? [['Loyalty Discount', `- ${fmtINR(result.loyalty_discount)}`]] : []),
          ['Total Paid',       fmtINR(result.amount_charged)],
          ['Points Earned',    result.points_earned > 0 ? `+${result.points_earned} pts 🎉` : '0 pts'],
        ].map(([k, v], idx) => (
          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 13, color: '#8A9BAE' }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: k === 'Total Paid' ? 700 : 600, color: k === 'Total Paid' ? '#10B981' : k === 'Loyalty Discount' ? '#F59E0B' : k === 'Points Earned' ? '#F59E0B' : '#F0F4F8' }}>{v}</span>
          </div>
        ))}
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center">Done</Btn>
    </Modal>
  );

  return (
    <Modal title="💳 Checkout" onClose={onClose}>
      <div style={{ background: '#0D1117', borderRadius: 12, padding: 14, marginBottom: 16 }}>
        {[['Plate', session.plate_number], ['Spot', `${session.spot_number} · ${session.lot_name}`], ['Parked', fmtDuration(session.elapsed_mins)]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 12, color: '#8A9BAE' }}>{k}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F0F4F8' }}>{v}</span>
          </div>
        ))}
      </div>
      <Field label="Payment Method">
        <Select value={method} onChange={e => setMethod(e.target.value)} className="w-full">
          <option value="upi">📱 UPI</option>
          <option value="cash">💵 Cash</option>
          <option value="card">💳 Card</option>
        </Select>
      </Field>
      {session.card_number && (
        <div style={{ padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span>🏆</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B' }}>{session.card_number}</span>
            <Badge variant="yellow">{session.tier}</Badge>
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ fontSize: 11, color: '#8A9BAE', display: 'block', marginBottom: 6 }}>Redeem points (100 pts = ₹10 off)</label>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Input type="number" min="0" step="100" placeholder="e.g. 200" value={redeemPts} onChange={e => setRedeemPts(e.target.value)} />
              {pts >= 100 && <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981', whiteSpace: 'nowrap' }}>−{fmtINR(ptDiscount)}</span>}
            </div>
            {pts > 0 && pts < 100 && <p style={{ fontSize: 10, color: '#EF4444', marginTop: 4 }}>Min 100 pts</p>}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 12, color: '#8A9BAE' }}>
            <input type="checkbox" checked={applyDisc} onChange={e => setApplyDisc(e.target.checked)} style={{ accentColor: '#F59E0B' }} />
            Auto-apply max 20% discount from points
          </label>
        </div>
      )}
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={handleCheckout} className="flex-1 justify-center" disabled={loading}>{loading ? 'Processing…' : 'Checkout'}</Btn>
      </div>
    </Modal>
  );
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function SessionsPage() {
  const [rows,      setRows]      = useState<any[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [tab,       setTab]       = useState<'active' | 'closed' | 'all'>('active');
  const [search,    setSearch]    = useState('');
  const [showEntry, setShowEntry] = useState(false);
  const [coSess,    setCoSess]    = useState<any>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    const d: any = await getSessions(tab, 100, 0, search);
    if (d && !d.error && Array.isArray(d)) {
      setRows(d);
    } else {
      // Demo mode fallback
      const mock = mockSessions();
      setRows(mock.filter((s: any) =>
        tab === 'all' ? true : tab === 'active' ? !s.exit_time : !!s.exit_time
      ));
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [tab, search]);

  async function handleCancel(s: any) {
    if (!confirm(`Cancel session for ${s.plate_number}?`)) return;
    setCancelling(s.id);
    await cancelSession(s.id);
    setCancelling(null);
    load();
  }

  const stats = useMemo(() => ({
    active:  rows.filter((r: any) => !r.exit_time && r.payment_status !== 'waived').length,
    closed:  rows.filter((r: any) => r.exit_time  && r.payment_status === 'paid').length,
    revenue: rows.filter((r: any) => r.payment_status === 'paid').reduce((a: number, r: any) => a + (Number(r.amount_charged) || 0), 0),
  }), [rows]);

  return (
    <div style={{ padding: 24 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Active Sessions', val: stats.active,          color: '#EF4444', icon: '🚗' },
          { label: 'Completed',       val: stats.closed,          color: '#10B981', icon: '✅' },
          { label: 'Revenue Shown',   val: fmtINR(stats.revenue), color: '#F59E0B', icon: '₹'  },
        ].map(({ label, val, color, icon }) => (
          <Card key={label} className="p-4 flex items-center gap-3">
            <div style={{ width: 40, height: 40, borderRadius: 12, display: 'grid', placeItems: 'center', fontSize: 18, background: `${color}18`, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color, lineHeight: 1.1 }}>{val}</div>
              <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{label}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            {(['active', 'closed', 'all'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, textTransform: 'capitalize', cursor: 'pointer', border: 'none', background: tab === t ? '#2563EB' : 'transparent', color: tab === t ? 'white' : '#8A9BAE', transition: 'all .15s' }}>
                {t}
              </button>
            ))}
          </div>
          <Input placeholder="Search plate…" value={search} onChange={e => setSearch(e.target.value)} className="w-44" />
          <Btn onClick={() => setShowEntry(true)} size="sm" style={{ marginLeft: 'auto' }}>+ New Entry</Btn>
        </div>

        {loading ? (
          <div style={{ padding: 20 }}>{[...Array(5)].map((_, i) => <div key={i} className="skeleton h-11 mb-2" />)}</div>
        ) : rows.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#4A5568', fontSize: 13 }}>No {tab} sessions found</div>
        ) : (
          <Table>
            <Thead>
              <tr>
                <Th>Plate</Th><Th>Owner</Th><Th>Spot</Th><Th>Entry</Th><Th>Duration</Th>
                <Th>Amount</Th><Th>Status</Th><Th>Loyalty</Th><Th>Actions</Th>
              </tr>
            </Thead>
            <tbody>
              {rows.map((s: any, idx: number) => (
                <Tr key={s.id ?? idx}>
                  <Td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#F0F4F8', fontSize: 12 }}>{s.plate_number}</span></Td>
                  <Td>{s.owner_name || '—'}</Td>
                  <Td>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#3B82F6' }}>{s.spot_number}</span>
                    <span style={{ fontSize: 10, color: '#4A5568', marginLeft: 4 }}>{s.lot_name}</span>
                  </Td>
                  <Td style={{ fontSize: 11 }}>{fmtDate(s.entry_time)}</Td>
                  <Td>{fmtDuration(s.exit_time ? s.duration_mins : s.elapsed_mins)}</Td>
                  <Td style={{ fontWeight: 600, color: '#F0F4F8' }}>{s.amount_charged ? fmtINR(s.amount_charged) : '—'}</Td>
                  <Td>
                    <Badge variant={s.payment_status === 'paid' ? 'green' : s.payment_status === 'waived' ? 'red' : 'yellow'}>
                      {s.payment_status || 'pending'}
                    </Badge>
                  </Td>
                  <Td>
                    {s.card_number
                      ? <span style={{ fontSize: 10, color: '#F59E0B' }}>{s.tier} · {s.card_number?.slice(-6)}</span>
                      : <span style={{ color: '#4A5568', fontSize: 10 }}>—</span>}
                  </Td>
                  <Td>
                    {!s.exit_time && s.payment_status !== 'waived' && (
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => setCoSess(s)} style={{ padding: '4px 10px', fontSize: 10, borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10B981', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Checkout</button>
                        <button onClick={() => handleCancel(s)} disabled={cancelling === s.id} style={{ padding: '4px 10px', fontSize: 10, borderRadius: 8, background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: cancelling === s.id ? 0.4 : 1 }}>
                          {cancelling === s.id ? '…' : 'Cancel'}
                        </button>
                      </div>
                    )}
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {showEntry && <EntryModal    onClose={() => setShowEntry(false)}  onDone={load} />}
      {coSess    && <CheckoutModal session={coSess} onClose={() => setCoSess(null)} onDone={load} />}
    </div>
  );
}
