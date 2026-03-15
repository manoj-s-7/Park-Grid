'use client';
import { useEffect, useState, useMemo } from 'react';
import { getVehicles, getVehicle, createLoyaltyCard, mockSessions, fmtINR, fmtDate, fmtDuration, mockCreateLoyaltyCard } from '@/lib/api';
import { Card, Badge, Table, Thead, Th, Tr, Td, Input, Btn } from '@/components/ui';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(6px)' }}>
      <div style={{ background: '#161D27', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, width: '100%', maxWidth: 540, margin: '0 16px', boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, background: '#161D27', zIndex: 10 }}>
          <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 600, color: '#F0F4F8', fontSize: 15, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4A5568', cursor: 'pointer', fontSize: 18, padding: 4 }}>✕</button>
        </div>
        <div style={{ padding: 24 }}>{children}</div>
      </div>
    </div>
  );
}

export default function VehiclesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<any>(null);
  const [issuing, setIssuing] = useState<number | null>(null);

  async function load() {
    const d: any = await getVehicles(search);
    if (Array.isArray(d) && d.length) { setRows(d); }
    else {
      const mock = mockSessions();
      const seen = new Set<string>();
      setRows(mock.filter((s: any) => { if (seen.has(s.plate_number)) return false; seen.add(s.plate_number); return true; }).map((s: any, i: number) => ({ id: i+1, plate_number: s.plate_number, owner_name: s.owner_name, vehicle_type: s.vehicle_type, card_number: s.card_number, tier: s.tier, points: s.points || 0, lc_status: 'active', created_at: s.entry_time })));
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, []);
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t); }, [search]);

  async function openDetail(v: any) {
    const d: any = await getVehicle(v.id);
    if (d?.vehicle) setDetail(d);
    else setDetail({ vehicle: v, sessions: mockSessions().filter((s: any) => s.plate_number === v.plate_number), loyalty_card: v.card_number ? { card_number: v.card_number, tier: v.tier, points: v.points, status: v.lc_status } : null });
  }

  async function issueCard(vehicleId: number) {
    setIssuing(vehicleId);
    let res: any = await createLoyaltyCard(vehicleId);
    if (!res || res.error) res = mockCreateLoyaltyCard(vehicleId);
    setIssuing(null);
    if (res?.card_number) { alert(`Card issued: ${res.card_number}`); load(); }
    else alert(res?.error || 'Could not issue card.');
  }

  const vtIcon: Record<string, string> = { car: '🚗', bike: '🏍️', truck: '🚛' };
  const tierBadge: Record<string, any> = { gold: 'yellow', silver: 'gray', bronze: 'yellow' };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, gap: 16 }}>
        <div style={{ flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F4F8', margin: '0 0 3px' }}>Vehicles</h2>
          <p style={{ fontSize: 12, color: '#4A5568', margin: 0 }}>{rows.length} registered</p>
        </div>
        <Input placeholder="🔍 Search plate or owner…" value={search} onChange={e => setSearch(e.target.value)} className="w-64" />
      </div>
      <Card className="overflow-hidden">
        {loading ? <div style={{ padding: 20 }}>{[...Array(6)].map((_, i) => <div key={i} className="skeleton h-11 mb-2" />)}</div>
        : rows.length === 0 ? <div style={{ padding: '48px 24px', textAlign: 'center', color: '#4A5568' }}>No vehicles found</div>
        : <Table><Thead><tr><Th>Plate</Th><Th>Owner</Th><Th>Type</Th><Th>Loyalty Card</Th><Th>Points</Th><Th>Actions</Th></tr></Thead>
          <tbody>{rows.map((v: any, idx: number) => (
            <Tr key={v.id ?? idx} onClick={() => openDetail(v)}>
              <Td><span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#F0F4F8', fontSize: 13 }}>{v.plate_number}</span></Td>
              <Td>{v.owner_name || '—'}</Td>
              <Td><span style={{ fontSize: 16 }}>{vtIcon[v.vehicle_type] || '🚗'}</span> <span style={{ fontSize: 12, color: '#8A9BAE', textTransform: 'capitalize' }}>{v.vehicle_type}</span></Td>
              <Td>{v.card_number ? <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#F59E0B' }}>{v.card_number}</span> : <span style={{ fontSize: 11, color: '#4A5568' }}>No card</span>}</Td>
              <Td>{v.tier ? <Badge variant={tierBadge[v.tier] || 'yellow'}>{['gold','silver','bronze'].includes(v.tier) ? {gold:'👑',silver:'🥈',bronze:'🥉'}[v.tier as string] : ''} {v.tier}</Badge> : <span style={{ color: '#4A5568', fontSize: 11 }}>—</span>}</Td>
              <Td onClick={e => e.stopPropagation()}>
                {!v.card_number ? (
                  <button onClick={() => issueCard(v.id)} disabled={issuing === v.id} style={{ padding: '4px 12px', fontSize: 11, borderRadius: 8, background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: 'none', cursor: 'pointer', fontWeight: 600, opacity: issuing === v.id ? 0.5 : 1 }}>
                    {issuing === v.id ? '…' : '🏆 Issue Card'}
                  </button>
                ) : <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981' }}>✓ {String(v.points || 0)} pts</span>}
              </Td>
            </Tr>
          ))}</tbody></Table>}
      </Card>
      {detail && (
        <Modal title={`🚗 ${detail.vehicle.plate_number}`} onClose={() => setDetail(null)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
            {[['Owner', detail.vehicle.owner_name || '—'], ['Type', detail.vehicle.vehicle_type], ['Vehicle ID', String(detail.vehicle.id)]].map(([k, v]) => (
              <div key={k} style={{ background: '#131920', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{k}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F0F4F8', textTransform: 'capitalize' }}>{v}</div>
              </div>
            ))}
            {detail.loyalty_card && (
              <div style={{ background: 'rgba(245,158,11,0.08)', borderRadius: 10, padding: '10px 12px', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: 10, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>Loyalty</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F59E0B' }}>{detail.loyalty_card.card_number}</div>
              </div>
            )}
          </div>
          <h4 style={{ fontSize: 12, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 12px', fontWeight: 600 }}>Recent Sessions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {(detail.sessions || []).slice(0, 8).map((s: any, i: number) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#131920', borderRadius: 10, padding: '10px 14px' }}>
                <div><div style={{ fontSize: 12, fontWeight: 600, color: '#F0F4F8' }}>{s.spot_number || '—'} · {s.lot || s.lot_name || '—'}</div><div style={{ fontSize: 10, color: '#4A5568' }}>{fmtDate(s.entry_time)}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 12, fontWeight: 700, color: '#10B981' }}>{s.amount_charged ? fmtINR(s.amount_charged) : '—'}</div><div style={{ fontSize: 10, color: '#4A5568' }}>{fmtDuration(s.duration_mins)}</div></div>
              </div>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
