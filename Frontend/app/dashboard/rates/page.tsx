'use client';
import { useEffect, useState } from 'react';
import { getRates, createRate, updateRate, deleteRate, mockRates, fmtINR } from '@/lib/api';
import { Card, Badge, Table, Thead, Th, Tr, Td, Input, Btn, Select } from '@/components/ui';

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
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

const VT = ['car','motorcycle','truck','ev'];
const ST = ['regular','ev','handicap','vip'];

export default function RatesPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ vehicle_type: 'car', spot_type: 'regular', rate_per_hr: '40', min_charge: '40', effective_from: new Date().toISOString().slice(0,10) });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');
  const f = (k: string) => (v: string) => setForm(p => ({ ...p, [k]: v }));

  async function load() {
    const d: any = await getRates();
    setRows((Array.isArray(d) && d.length) ? d : mockRates());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function openEdit(r: any) { setEditing(r); setForm({ vehicle_type: r.vehicle_type, spot_type: r.spot_type, rate_per_hr: String(r.rate_per_hr), min_charge: String(r.min_charge), effective_from: r.effective_from || new Date().toISOString().slice(0,10) }); setShowForm(true); setErr(''); }
  function openAdd() { setEditing(null); setForm({ vehicle_type: 'car', spot_type: 'regular', rate_per_hr: '40', min_charge: '40', effective_from: new Date().toISOString().slice(0,10) }); setShowForm(true); setErr(''); }

  async function save() {
    if (!form.rate_per_hr) { setErr('Rate per hour required'); return; }
    setSaving(true); setErr('');
    const payload = { vehicle_type: form.vehicle_type, spot_type: form.spot_type, rate_per_hr: Number(form.rate_per_hr), min_charge: Number(form.min_charge), effective_from: form.effective_from };
    let res: any;
    if (editing) { res = await updateRate(editing.id, payload); if (!res) res = { message: 'Updated (demo)' }; }
    else { res = await createRate(payload); if (!res || !res.message) res = { message: 'Saved (demo)' }; }
    setSaving(false);
    if (res?.error) { setErr(res.error); return; }
    setShowForm(false); load();
  }

  async function del(r: any) {
    if (!confirm(`Delete rate for ${r.vehicle_type} / ${r.spot_type}?`)) return;
    await deleteRate(r.id);
    setRows(prev => prev.filter(x => x.id !== r.id));
  }

  const vtColor: Record<string, string> = { car: '#3B82F6', motorcycle: '#8B5CF6', truck: '#F59E0B', ev: '#06B6D4' };
  const stColor: Record<string, string> = { regular: '#10B981', ev: '#06B6D4', handicap: '#9CA3AF', vip: '#F59E0B' };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div><h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 18, color: '#F0F4F8', margin: '0 0 3px' }}>Pricing Rates</h2><p style={{ fontSize: 12, color: '#4A5568', margin: 0 }}>{rows.length} rate{rows.length !== 1 ? 's' : ''} configured</p></div>
        <Btn onClick={openAdd}>+ Add Rate</Btn>
      </div>
      <Card className="overflow-hidden">
        {loading ? <div style={{ padding: 20 }}>{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-11 mb-2" />)}</div>
        : <Table><Thead><tr><Th>Vehicle Type</Th><Th>Spot Type</Th><Th>Rate/hr</Th><Th>Min Charge</Th><Th>Effective From</Th><Th>Actions</Th></tr></Thead>
          <tbody>{rows.map((r: any) => (
            <Tr key={r.id}>
              <Td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 8, background: `${vtColor[r.vehicle_type] || '#9CA3AF'}18`, color: vtColor[r.vehicle_type] || '#9CA3AF', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{r.vehicle_type}</span></Td>
              <Td><span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 8, background: `${stColor[r.spot_type] || '#9CA3AF'}18`, color: stColor[r.spot_type] || '#9CA3AF', fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{r.spot_type}</span></Td>
              <Td style={{ fontWeight: 700, color: '#F0F4F8', fontSize: 14 }}>{fmtINR(r.rate_per_hr)}</Td>
              <Td>{fmtINR(r.min_charge)}</Td>
              <Td style={{ fontSize: 11 }}>{r.effective_from || '—'}</Td>
              <Td><div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(r)} style={{ padding: '4px 12px', fontSize: 11, borderRadius: 8, background: 'rgba(37,99,235,0.12)', color: '#3B82F6', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                <button onClick={() => del(r)} style={{ padding: '4px 12px', fontSize: 11, borderRadius: 8, background: 'rgba(239,68,68,0.10)', color: '#EF4444', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
              </div></Td>
            </Tr>
          ))}</tbody></Table>}
      </Card>
      {showForm && <Modal title={editing ? '✏️ Edit Rate' : '➕ Add Rate'} onClose={() => setShowForm(false)}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={{ display: 'block', fontSize: 11, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Vehicle Type</label>
            <Select value={form.vehicle_type} onChange={e => f('vehicle_type')(e.target.value)} className="w-full">{VT.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
          <div><label style={{ display: 'block', fontSize: 11, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Spot Type</label>
            <Select value={form.spot_type} onChange={e => f('spot_type')(e.target.value)} className="w-full">{ST.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
          <div><label style={{ display: 'block', fontSize: 11, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Rate/hr (₹)</label><Input type="number" min="0" value={form.rate_per_hr} onChange={e => f('rate_per_hr')(e.target.value)} /></div>
          <div><label style={{ display: 'block', fontSize: 11, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Min Charge (₹)</label><Input type="number" min="0" value={form.min_charge} onChange={e => f('min_charge')(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: 16 }}><label style={{ display: 'block', fontSize: 11, color: '#8A9BAE', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Effective From</label><Input type="date" value={form.effective_from} onChange={e => f('effective_from')(e.target.value)} /></div>
        {err && <p style={{ fontSize: 12, color: '#EF4444', background: 'rgba(239,68,68,0.08)', padding: '10px 14px', borderRadius: 8, marginBottom: 12 }}>{err}</p>}
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="outline" onClick={() => setShowForm(false)} className="flex-1 justify-center">Cancel</Btn>
          <Btn onClick={save} className="flex-1 justify-center" disabled={saving}>{saving ? 'Saving…' : 'Save Rate'}</Btn>
        </div>
      </Modal>}
    </div>
  );
}
