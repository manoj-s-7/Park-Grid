'use client';
import { useEffect, useState } from 'react';
import { getEVStations, updateEVStation, evCheckout, vehicleEntry, checkout, getSessions, getSpots, mockEV, mockSpots, mockSessions, fmtINR, fmtDuration, mockVehicleEntry } from '@/lib/api';
import { Card, Badge, Input, Btn, Select } from '@/components/ui';

const STATUS_CFG: Record<string, any> = {
  charging:  { color: '#06B6D4', bg: 'rgba(6,182,212,0.12)',  label: 'Charging'  },
  available: { color: '#10B981', bg: 'rgba(16,185,129,0.12)', label: 'Available' },
  offline:   { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  label: 'Offline'   },
  reserved:  { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', label: 'Reserved'  },
};

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(7px)' }}>
      <div style={{ background: '#161D27', border: '1px solid rgba(255,255,255,0.09)', borderRadius: 20, width: '100%', maxWidth: 440, margin: '0 16px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F0F4F8', fontSize: 15, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

function BookEVModal({ station, onClose, onDone }: { station: any; onClose: () => void; onDone: () => void }) {
  const [plate, setPlate] = useState('');
  const [owner, setOwner] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  async function submit() {
    if (!plate.trim()) { setErr('Plate number required'); return; }
    setLoading(true); setErr('');
    const spots: any = await getSpots({ status: 'available', type: 'ev' });
    const list = (Array.isArray(spots) && spots.length) ? spots : mockSpots().filter((s: any) => s.spot_type === 'ev' && s.status === 'available');
    const evSpot = list.find((s: any) => s.spot_number === station.spot_number) ?? list[0];
    if (!evSpot) { setErr('No available EV spot.'); setLoading(false); return; }
    let res: any = await vehicleEntry({ plate_number: plate.toUpperCase(), spot_id: evSpot.id, vehicle_type: 'car', owner_name: owner });
    if (!res || !res.session_id) res = mockVehicleEntry({ plate_number: plate, spot_id: evSpot.id });
    if (res?.error) { setErr(res.error); setLoading(false); return; }
    await updateEVStation(station.id, 'charging');
    setLoading(false); setDone(true);
  }

  if (done) return (
    <Modal title="✅ EV Session Started" onClose={() => { onDone(); onClose(); }}>
      <div style={{ textAlign: 'center', padding: '12px 0 16px' }}>
        <div style={{ fontSize: 48 }}>⚡</div>
        <p style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F4F8', margin: '10px 0 4px' }}>Charging Started!</p>
        <p style={{ fontSize: 13, color: '#8A9BAE', margin: 0 }}>{station.spot_number} · {station.lot_name}</p>
        <p style={{ fontSize: 11, color: '#4A5568', margin: '6px 0 0' }}>{plate.toUpperCase()} · {station.power_kw ?? 7.2} kW</p>
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center" style={{ background: 'linear-gradient(135deg,#06B6D4,#0284c7)' }}>Done</Btn>
    </Modal>
  );

  return (
    <Modal title={`⚡ Start EV Charging — ${station.spot_number}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18, padding: 14, borderRadius: 12, background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
        {[['Station', station.spot_number], ['Location', station.lot_name], ['Power', `${station.power_kw ?? 7.2} kW`], ['Connector', station.connector_type || 'Type 2']].map(([k, v]) => (
          <div key={k}><div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>{k}</div><div style={{ fontSize: 13, fontWeight: 600, color: '#F0F4F8' }}>{v}</div></div>
        ))}
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vehicle Plate *</label>
        <Input placeholder="KA01AB1234" value={plate} onChange={e => setPlate(e.target.value.toUpperCase())} />
      </div>
      <div style={{ marginBottom: 14 }}>
        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Owner Name</label>
        <Input placeholder="Full name (optional)" value={owner} onChange={e => setOwner(e.target.value)} />
      </div>
      {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
      <div style={{ display: 'flex', gap: 10 }}>
        <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
        <Btn onClick={submit} className="flex-1 justify-center" disabled={loading} style={{ background: 'linear-gradient(135deg,#06B6D4,#0284c7)' }}>{loading ? 'Starting…' : '⚡ Start'}</Btn>
      </div>
    </Modal>
  );
}

function EVCheckoutModal({ station, onClose, onDone }: { station: any; onClose: () => void; onDone: () => void }) {
  const [method, setMethod] = useState('upi');
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    getSessions('active', 100).then((d: any) => {
      const list = (Array.isArray(d) && d.length) ? d : mockSessions().filter((s: any) => !s.exit_time);
      // Match by exact spot_number first, then fallback to lot+ev type
      const active = list.find((s: any) => s.spot_number === station.spot_number)
        ?? list.find((s: any) => s.lot_name === station.lot_name && s.spot_type === 'ev');
      setSession(active || null);
      setFetching(false);
    });
  }, [station]);

  async function handleCheckout() {
    if (!session) { setErr('No active session found for this station'); return; }
    setLoading(true); setErr('');
    // Use the dedicated EV checkout endpoint which handles station→session lookup server-side
    let res: any = await evCheckout(station.id, { payment_method: method });
    // If EV-specific endpoint fails (e.g. no loyalty_discount column), fallback to session checkout
    if (!res || res.amount_charged === undefined) {
      res = await checkout(session.id, { payment_method: method });
    }
    // Final demo fallback
    if (!res || res.amount_charged === undefined) {
      const rate = 60; const hrs = Math.ceil((session.elapsed_mins || 60) / 60);
      const charged = Math.max(rate, hrs * rate);
      res = { amount_charged: charged, original_amount: charged, loyalty_discount: 0, duration_mins: session.elapsed_mins || 60, points_earned: Math.floor(charged / 10), message: 'EV checkout (demo)' };
    }
    await updateEVStation(station.id, 'available');
    setLoading(false);
    if (res?.amount_charged !== undefined) setResult(res);
    else setErr(res?.error || 'Checkout failed.');
  }

  if (result) return (
    <Modal title="✅ EV Checkout Complete" onClose={() => { onDone(); onClose(); }}>
      <div style={{ marginBottom: 20 }}>
        {[['Vehicle', session?.plate_number], ['Duration', fmtDuration(result.duration_mins)], ['Total Paid', fmtINR(result.amount_charged)], ['Points', `+${result.points_earned} pts 🎉`]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: 13, color: '#8A9BAE' }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: k === 'Total Paid' ? '#10B981' : '#F0F4F8' }}>{v}</span>
          </div>
        ))}
      </div>
      <Btn onClick={() => { onDone(); onClose(); }} className="w-full justify-center">Done</Btn>
    </Modal>
  );

  return (
    <Modal title={`💳 EV Checkout — ${station.spot_number}`} onClose={onClose}>
      {fetching ? <div style={{ padding: '32px 0', textAlign: 'center', color: '#8A9BAE' }}>Looking up session…</div>
      : !session ? (
        <div style={{ padding: '32px 0', textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <p style={{ fontSize: 13, color: '#EF4444' }}>No active session for this station.</p>
        </div>
      ) : (
        <>
          <div style={{ background: '#0D1117', borderRadius: 12, padding: 14, marginBottom: 16 }}>
            {[['Plate', session.plate_number], ['Duration', fmtDuration(session.elapsed_mins)], ['Station', station.spot_number]].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize: 12, color: '#8A9BAE' }}>{k}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#F0F4F8' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Payment Method</label>
            <Select value={method} onChange={e => setMethod(e.target.value)} className="w-full">
              <option value="upi">📱 UPI</option><option value="cash">💵 Cash</option><option value="card">💳 Card</option>
            </Select>
          </div>
          {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="outline" onClick={onClose} className="flex-1 justify-center">Cancel</Btn>
            <Btn onClick={handleCheckout} className="flex-1 justify-center" disabled={loading} style={{ background: 'linear-gradient(135deg,#06B6D4,#0284c7)' }}>{loading ? 'Processing…' : '💳 Checkout'}</Btn>
          </div>
        </>
      )}
    </Modal>
  );
}

function EVStationCard({ station, onBook, onCheckout, onToggle }: { station: any; onBook: () => void; onCheckout: () => void; onToggle: () => void }) {
  const status = station.status || 'available';
  const cfg = STATUS_CFG[status] || STATUS_CFG.available;
  const isCharging = status === 'charging';
  return (
    <div style={{ borderRadius: 20, overflow: 'hidden', background: '#161D27', border: `1.5px solid ${cfg.color}28`, transition: 'transform .2s' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-3px)'}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform = ''}>
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, boxShadow: isCharging ? `0 0 8px ${cfg.color}` : 'none' }} className={isCharging ? 'animate-pulse' : ''} />
            <span style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 15, color: '#F0F4F8' }}>{station.spot_number}</span>
          </div>
          <div style={{ padding: '3px 10px', borderRadius: 8, background: cfg.bg, color: cfg.color, fontSize: 11, fontWeight: 600 }}>{cfg.label}</div>
        </div>
        <p style={{ fontSize: 11, color: '#4A5568', margin: 0 }}>📍 {station.lot_name}</p>
      </div>
      <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
        {[{ label: 'Power', val: `${station.power_kw ?? 7.2} kW`, icon: '⚡' }, { label: 'Connector', val: station.connector_type || 'Type 2', icon: '🔌' }].map(({ label, val, icon }) => (
          <div key={label} style={{ borderRadius: 10, padding: '10px 10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ fontSize: 14 }}>{icon}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#F0F4F8', marginTop: 4 }}>{val}</div>
            <div style={{ fontSize: 9, color: '#4A5568', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: '0 16px 16px', display: 'flex', gap: 8 }}>
        {status === 'available' && <button onClick={onBook} style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'linear-gradient(135deg,#06B6D4,#0284c7)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>⚡ Start</button>}
        {status === 'charging'  && <button onClick={onCheckout} style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'linear-gradient(135deg,#10B981,#059669)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>💳 Checkout</button>}
        {status === 'offline'   && <button onClick={onToggle} style={{ flex: 1, padding: '8px', borderRadius: 10, background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.25)', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>✅ Set Available</button>}
        {status !== 'offline'   && <button onClick={onToggle} style={{ padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', color: '#4A5568', border: '1px solid rgba(255,255,255,0.07)', cursor: 'pointer', fontSize: 12 }}>{status === 'available' ? 'Set Offline' : '⬛'}</button>}
      </div>
    </div>
  );
}

export default function EVPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lotFilter, setLotFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [bookSt, setBookSt] = useState<any>(null);
  const [checkSt, setCheckSt] = useState<any>(null);

  async function load() {
    setLoading(true);
    const d: any = await getEVStations();
    setStations((Array.isArray(d) && d.length) ? d : mockEV());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleToggle(station: any) {
    const next = station.status === 'available' ? 'offline' : station.status === 'offline' ? 'available' : station.status;
    await updateEVStation(station.id, next);
    setStations(prev => prev.map(s => s.id === station.id ? { ...s, status: next } : s));
  }

  const lots = [...new Set(stations.map((s: any) => s.lot_name))];
  const filtered = stations.filter((s: any) => {
    if (lotFilter && s.lot_name !== lotFilter) return false;
    if (statusFilter && s.status !== statusFilter) return false;
    return true;
  });
  const counts = { charging: stations.filter(s => s.status === 'charging').length, available: stations.filter(s => s.status === 'available').length, offline: stations.filter(s => s.status === 'offline').length, total: stations.length };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[{ icon: '⚡', label: 'Charging Now', val: counts.charging, color: '#06B6D4' }, { icon: '🟢', label: 'Available', val: counts.available, color: '#10B981' }, { icon: '🔴', label: 'Offline', val: counts.offline, color: '#EF4444' }, { icon: '🔌', label: 'Total Stations', val: counts.total, color: '#8B5CF6' }].map(({ icon, label, val, color }) => (
          <div key={label} style={{ borderRadius: 20, padding: 16, background: '#161D27', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontSize: 24 }}>{icon}</div>
            <div><div style={{ fontSize: 24, fontWeight: 700, color, fontFamily: 'Syne, sans-serif', lineHeight: 1.1 }}>{loading ? '…' : val}</div><div style={{ fontSize: 11, color: '#4A5568', marginTop: 2 }}>{label}</div></div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <Select value={lotFilter} onChange={e => setLotFilter(e.target.value)}><option value="">All Lots</option>{lots.map(l => <option key={l as string} value={l as string}>{l as string}</option>)}</Select>
        <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option value="">All Status</option><option value="charging">⚡ Charging</option><option value="available">🟢 Available</option><option value="offline">🔴 Offline</option></Select>
        <span style={{ fontSize: 11, color: '#4A5568', marginLeft: 'auto', alignSelf: 'center' }}>{filtered.length} stations</span>
      </div>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>{[...Array(8)].map((_, i) => <div key={i} className="skeleton rounded-2xl" style={{ height: 200 }} />)}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
          {filtered.map((s: any) => <EVStationCard key={s.id} station={s} onBook={() => setBookSt(s)} onCheckout={() => setCheckSt(s)} onToggle={() => handleToggle(s)} />)}
        </div>
      )}
      {bookSt  && <BookEVModal     station={bookSt}  onClose={() => setBookSt(null)}  onDone={load} />}
      {checkSt && <EVCheckoutModal station={checkSt} onClose={() => setCheckSt(null)} onDone={load} />}
    </div>
  );
}
