'use client';
import { useEffect, useState } from 'react';
import {
  getLots, getLot, createLot, deleteLot,
  vehicleEntry, createLoyaltyCard, getSpots,
  mockLots, mockSpots, mockVehicleEntry, mockCreateLoyaltyCard,
} from '@/lib/api';
import { Card, Input, Btn, Select } from '@/components/ui';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(8px)' }}>
      <div style={{ background: '#161D27', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, width: '100%', maxWidth: 520, margin: '0 16px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#161D27', zIndex: 10 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F0F4F8', fontSize: 15, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}>✕</button>
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

/* ── Create Lot ─────────────────────────────────────────────────────────── */
function CreateLotModal({ onClose, onDone }: { onClose: () => void; onDone: (lot: any) => void }) {
  const [form, setForm] = useState({ name: '', location: '', total_spots: '50', floors: '1', spot_type: 'regular', auto_generate: true });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  async function submit() {
    if (!form.name.trim()) { setErr('Lot name required'); return; }
    setLoading(true); setErr('');
    const res: any = await createLot({
      name: form.name.trim(), location: form.location.trim(),
      total_spots: Number(form.total_spots), floors: Number(form.floors),
      spot_type: form.spot_type, auto_generate_spots: form.auto_generate,
    });
    setLoading(false);
    if (res?.id) {
      onDone(res);
    } else if (res?.error) {
      setErr(res.error);
    } else {
      // Demo mode — simulate created lot
      const newLot = {
        id: Date.now(),
        name: form.name.trim(), location: form.location.trim(),
        total_spots: Number(form.total_spots),
        occupied_spots: 0, available_spots: Number(form.total_spots),
        reserved_spots: 0, occupancy_pct: 0,
      };
      onDone(newLot);
    }
  }

  return (
    <Modal title="🏢 Create Parking Lot" onClose={onClose}>
      <Field label="Lot Name *"><Input placeholder="e.g. Lot E" value={form.name} onChange={e => f('name')(e.target.value)} /></Field>
      <Field label="Location"><Input placeholder="Block 5, Ground Floor" value={form.location} onChange={e => f('location')(e.target.value)} /></Field>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Field label="Total Spots"><Input type="number" min="1" value={form.total_spots} onChange={e => f('total_spots')(e.target.value)} /></Field>
        <Field label="Floors"><Input type="number" min="1" max="10" value={form.floors} onChange={e => f('floors')(e.target.value)} /></Field>
      </div>
      <Field label="Default Spot Type">
        <Select value={form.spot_type} onChange={e => f('spot_type')(e.target.value)} className="w-full">
          <option value="regular">🚗 Regular</option>
          <option value="ev">⚡ EV Charging</option>
          <option value="handicap">♿ Handicap</option>
          <option value="vip">⭐ VIP</option>
        </Select>
      </Field>
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, cursor: 'pointer', fontSize: 13, color: '#8A9BAE' }}>
        <input type="checkbox" checked={form.auto_generate} onChange={e => setForm(p => ({ ...p, auto_generate: e.target.checked }))} style={{ accentColor: '#2563EB', width: 16, height: 16 }} />
        Auto-generate spots
      </label>
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading}>{loading ? 'Creating…' : 'Create Lot'}</Btn>
      </div>
    </Modal>
  );
}

/* ── New Entry Modal ─────────────────────────────────────────────────────── */
function NewEntryModal({ lot, onClose, onDone }: { lot: any; onClose: () => void; onDone: () => void }) {
  const [spots, setSpots]   = useState<any[]>([]);
  const [plate, setPlate]   = useState('');
  const [owner, setOwner]   = useState('');
  const [vtype, setVtype]   = useState('car');
  const [spotId, setSpotId] = useState('');
  const [wantCard, setWantCard] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [step, setStep]        = useState<'form' | 'success'>('form');
  const [result, setResult]    = useState<any>(null);
  const [err, setErr]          = useState('');

  useEffect(() => {
    const params: any = { status: 'available' };
    if (lot?.id) params.lot_id = String(lot.id);
    getSpots(params).then((d: any) => {
      const list = (d && !d.error) ? d : mockSpots().filter((s: any) => s.status === 'available' && (!lot?.id || s.lot_id === lot.id || s.lot_name === lot.name));
      setSpots(list);
      if (list.length > 0) setSpotId(String(list[0].id));
    });
  }, [lot]);

  async function submit() {
    if (!plate.trim()) { setErr('Plate number required'); return; }
    if (!spotId) { setErr('Select a parking spot'); return; }
    setLoading(true); setErr('');

    let res: any = await vehicleEntry({
      plate_number: plate.toUpperCase(), spot_id: Number(spotId),
      vehicle_type: vtype, owner_name: owner,
    });
    // Fallback to demo mode if backend unavailable
    if (!res || !res.session_id) {
      res = mockVehicleEntry({ plate_number: plate, spot_id: Number(spotId) });
    }
    if (res?.error) { setErr(res.error); setLoading(false); return; }

    let cardInfo = null;
    if (wantCard && res?.vehicle_id) {
      let card: any = await createLoyaltyCard(res.vehicle_id);
      if (!card || card.error) card = mockCreateLoyaltyCard(res.vehicle_id);
      cardInfo = card?.card_number ? card : null;
    }
    setLoading(false);
    setResult({ ...res, cardInfo });
    setStep('success');
  }

  const selectedSpot = spots.find((s: any) => String(s.id) === spotId);

  if (step === 'success') return (
    <Modal title="✅ Entry Recorded" onClose={() => { onDone(); onClose(); }}>
      <div style={{ textAlign: 'center', padding: '12px 0' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 20, color: '#F0F4F8', marginBottom: 6 }}>{plate.toUpperCase()}</p>
        <p style={{ fontSize: 13, color: '#8A9BAE', marginBottom: 16 }}>Session #{result?.session_id} · {selectedSpot?.spot_number || spotId}</p>
        {result?.cardInfo && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 12, background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.3)', fontSize: 13 }}>
            <span>🏆</span>
            <span style={{ color: '#F59E0B', fontWeight: 600 }}>Card: {result.cardInfo.card_number}</span>
          </div>
        )}
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center" style={{ marginTop: 16 }}>Done</Btn>
    </Modal>
  );

  return (
    <Modal title={`🚗 New Entry${lot ? ` — ${lot.name}` : ''}`} onClose={onClose}>
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
          <p style={{ fontSize: 11, color: '#8A9BAE', margin: 0 }}>Earn points from this session · starts at 🥉 Bronze tier</p>
        </div>
      </label>
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading || !spotId}>
          {loading ? 'Recording…' : 'Record Entry'}
        </Btn>
      </div>
    </Modal>
  );
}

/* ── Lot Detail Modal ────────────────────────────────────────────────────── */
function LotDetailModal({ lot, onClose }: { lot: any; onClose: () => void }) {
  const [spots, setSpots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLot(lot.id).then((d: any) => {
      if (d?.spots) setSpots(d.spots);
      else setSpots(mockSpots().filter((s: any) => s.lot_name === lot.name));
      setLoading(false);
    });
  }, [lot]);

  const byStatus = (s: string) => spots.filter((sp: any) => sp.status === s).length;

  return (
    <Modal title={`📍 ${lot.name} — Spot View`} onClose={onClose}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: '#8A9BAE' }}>Loading spots…</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
            {[
              { label: 'Total',    val: spots.length,        color: '#3B82F6' },
              { label: 'Free',     val: byStatus('available'), color: '#10B981' },
              { label: 'Occupied', val: byStatus('occupied'),  color: '#EF4444' },
              { label: 'Reserved', val: byStatus('reserved'),  color: '#F59E0B' },
            ].map(({ label, val, color }) => (
              <div key={label} style={{ borderRadius: 12, padding: '10px 8px', textAlign: 'center', background: `${color}12`, border: `1px solid ${color}28` }}>
                <div style={{ fontSize: 20, fontWeight: 700, color, lineHeight: 1.1 }}>{val}</div>
                <div style={{ fontSize: 10, color: '#4A5568', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 280, overflowY: 'auto', paddingRight: 4 }}>
            {spots.map((sp: any) => {
              const C: Record<string, any> = {
                available: { bg: 'rgba(16,185,129,.12)', bc: 'rgba(16,185,129,.4)', tc: '#10B981' },
                occupied:  { bg: 'rgba(239,68,68,.14)',  bc: 'rgba(239,68,68,.4)',  tc: '#EF4444' },
                reserved:  { bg: 'rgba(245,158,11,.14)', bc: 'rgba(245,158,11,.4)', tc: '#F59E0B' },
              };
              const c = C[sp.status] || C.available;
              return (
                <div key={sp.id} title={`${sp.spot_number} · ${sp.spot_type} · ${sp.status}`}
                  style={{ width: 50, height: 38, borderRadius: 7, background: c.bg, border: `1px solid ${c.bc}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                  <span style={{ fontSize: 10, color: c.tc, fontWeight: 700, lineHeight: 1 }}>
                    {sp.spot_number?.slice(-3) || '???'}
                  </span>
                  <span style={{ fontSize: 9, color: '#4A5568' }}>
                    {sp.spot_type === 'ev' ? '⚡' : sp.spot_type === 'handicap' ? '♿' : sp.spot_type === 'vip' ? '⭐' : ''}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}

/* ── Lot Card ───────────────────────────────────────────────────────────── */
function LotCard({ lot, onEntry, onView, onDelete }: { lot: any; onEntry: () => void; onView: () => void; onDelete: () => void }) {
  const occupied  = Number(lot.occupied_spots)  || 0;
  const available = Number(lot.available_spots) || 0;
  const reserved  = Number(lot.reserved_spots)  || 0;
  const total     = Number(lot.total_spots)     || 1;
  const occ       = Number(lot.occupancy_pct)   || Math.round((occupied / total) * 100);
  const color     = occ >= 80 ? '#EF4444' : occ >= 50 ? '#F59E0B' : '#10B981';
  const bgColor   = occ >= 80 ? 'rgba(239,68,68,0.08)' : occ >= 50 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';

  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', background: '#161D27', border: '1px solid rgba(255,255,255,0.07)', transition: 'transform .2s, box-shadow .2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 12px 40px rgba(0,0,0,0.4)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ''; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}>

      {/* Header */}
      <div style={{ padding: '16px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
          <div>
            <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 16, color: '#F0F4F8', margin: '0 0 3px', lineHeight: 1.2 }}>{lot.name}</h3>
            <p style={{ fontSize: 11, color: '#4A5568', margin: 0 }}>📍 {lot.location || 'No location set'}</p>
          </div>
          <div style={{ padding: '3px 10px', borderRadius: 8, background: bgColor, color, fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
            {occ}% Full
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: '14px 20px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
          {[
            { icon: '🟢', label: 'Free',     val: available, c: '#10B981' },
            { icon: '🔴', label: 'Occupied', val: occupied,  c: '#EF4444' },
            { icon: '🟡', label: 'Reserved', val: reserved,  c: '#F59E0B' },
          ].map(({ icon, label, val, c }) => (
            <div key={label} style={{ borderRadius: 12, padding: '10px 8px', textAlign: 'center', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ fontSize: 16, lineHeight: 1 }}>{icon}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: c, lineHeight: 1.2, marginTop: 4 }}>{val}</div>
              <div style={{ fontSize: 9, color: '#4A5568', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#4A5568', marginBottom: 6 }}>
            <span>Occupancy</span>
            <span>{occupied} / {total} spots</span>
          </div>
          <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(occ, 100)}%`, borderRadius: 100, background: `linear-gradient(90deg,${color}88,${color})`, transition: 'width .8s ease' }} />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onEntry} style={{ flex: 1, padding: '8px 12px', borderRadius: 10, background: '#2563EB', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'opacity .15s' }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '.85')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}>
            + New Entry
          </button>
          <button onClick={onView} style={{ padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#8A9BAE', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', fontSize: 12, fontWeight: 500 }}>
            View Spots
          </button>
          <button onClick={onDelete} style={{ padding: '8px 10px', borderRadius: 10, background: 'transparent', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)', cursor: 'pointer', fontSize: 13 }}>
            🗑
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function LotsPage() {
  const [lots, setLots]         = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [entryLot, setEntryLot]     = useState<any>(null);
  const [viewLot, setViewLot]       = useState<any>(null);

  async function load() {
    setLoading(true);
    const d: any = await getLots();
    setLots((d && !d.error && Array.isArray(d)) ? d : mockLots());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id: number, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await deleteLot(id);
    setLots(prev => prev.filter(l => l.id !== id));
  }

  function handleCreated(newLot: any) {
    setLots(prev => [...prev, newLot]);
    setShowCreate(false);
  }

  const totalSpots = lots.reduce((a, l) => a + (Number(l.total_spots) || 0), 0);
  const totalFree  = lots.reduce((a, l) => a + (Number(l.available_spots) || 0), 0);
  const totalOcc   = lots.reduce((a, l) => a + (Number(l.occupied_spots) || 0), 0);

  return (
    <div style={{ padding: 24 }}>

      {/* KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { icon: '🏢', label: 'Total Lots',    val: lots.length, color: '#3B82F6' },
          { icon: '🅿️', label: 'Total Spots',   val: totalSpots,  color: '#8B5CF6' },
          { icon: '🟢', label: 'Available Now',  val: totalFree,   color: '#10B981' },
          { icon: '🔴', label: 'Occupied Now',   val: totalOcc,    color: '#EF4444' },
        ].map(({ icon, label, val, color }) => (
          <div key={label} style={{ borderRadius: 20, padding: '16px', background: '#161D27', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 24, flexShrink: 0 }}>{icon}</div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color, lineHeight: 1.1, fontFamily: 'Syne, sans-serif' }}>{loading ? '…' : val}</div>
              <div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F4F8', margin: '0 0 3px' }}>Parking Lots</h2>
          <p style={{ fontSize: 12, color: '#4A5568', margin: 0 }}>{lots.length} lot{lots.length !== 1 ? 's' : ''} managed</p>
        </div>
        <Btn onClick={() => setShowCreate(true)}>+ Create Lot</Btn>
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ borderRadius: 20, height: 220 }} />)}
        </div>
      ) : lots.length === 0 ? (
        <div style={{ borderRadius: 20, padding: '64px 24px', textAlign: 'center', background: '#161D27', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
          <p style={{ fontSize: 16, fontWeight: 600, color: '#F0F4F8', marginBottom: 6 }}>No parking lots yet</p>
          <p style={{ fontSize: 13, color: '#4A5568', marginBottom: 20 }}>Create your first lot to get started</p>
          <Btn onClick={() => setShowCreate(true)}>+ Create Lot</Btn>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {lots.map((lot: any, idx: number) => (
            <div key={String(lot.id ?? lot.name ?? idx)}>
              <LotCard
                lot={lot}
                onEntry={() => setEntryLot(lot)}
                onView={() => setViewLot(lot)}
                onDelete={() => handleDelete(lot.id, lot.name)}
              />
            </div>
          ))}
        </div>
      )}

      {showCreate && <CreateLotModal onClose={() => setShowCreate(false)} onDone={handleCreated} />}
      {entryLot   && <NewEntryModal  lot={entryLot} onClose={() => setEntryLot(null)} onDone={load} />}
      {viewLot    && <LotDetailModal lot={viewLot}  onClose={() => setViewLot(null)} />}
    </div>
  );
}
