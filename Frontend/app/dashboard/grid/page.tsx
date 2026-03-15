'use client';
import { useEffect, useState, useMemo } from 'react';
import { getOccupancyMap, mockSpots } from '@/lib/api';
import { Card, SectionHead, LiveDot, Select } from '@/components/ui';
import ParkingGrid, { GridLegend } from '@/components/dashboard/ParkingGrid';

const FILTERS = [
  { label: 'All',         value: 'all',         emoji: '🔍' },
  { label: 'Available',   value: 'available',   emoji: '✅' },
  { label: 'Occupied',    value: 'occupied',    emoji: '🚗' },
  { label: 'Reserved',    value: 'reserved',    emoji: '🔒' },
  { label: 'EV',          value: 'ev',          emoji: '🔌' },
  { label: 'Charging',    value: 'charging',    emoji: '⚡' },
  { label: 'VIP',         value: 'vip',         emoji: '⭐' },
  { label: 'Handicap',    value: 'handicap',    emoji: '♿' },
  { label: 'Maintenance', value: 'maintenance', emoji: '🔧' },
];

export default function GridPage() {
  const [spots, setSpots]         = useState<any[]>([]);
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [lotFilter, setLotFilter] = useState('');
  const [floorFilter, setFloorFilter] = useState('');

  useEffect(() => {
    getOccupancyMap().then((d: any) => {
      setSpots((Array.isArray(d) && d.length) ? d : mockSpots());
      setLoading(false);
    });
  }, []);

  const lots   = useMemo(() => [...new Set(spots.map((s: any) => s.lot_name))].sort(), [spots]);
  const floors = useMemo(() => [...new Set(spots.map((s: any) => s.floor))].sort((a: any, b: any) => Number(a) - Number(b)), [spots]);

  const filtered = useMemo(() => spots.filter((s: any) => {
    if (lotFilter   && s.lot_name !== lotFilter)        return false;
    if (floorFilter && String(s.floor) !== floorFilter) return false;
    if (filter === 'ev')       return s.spot_type === 'ev';
    if (filter === 'charging') return s.spot_type === 'ev' && s.status === 'charging';
    if (filter === 'handicap') return s.spot_type === 'handicap';
    if (filter !== 'all')      return s.status === filter;
    return true;
  }), [spots, filter, lotFilter, floorFilter]);

  const stats = useMemo(() => ({
    total:     spots.length,
    available: spots.filter((s: any) => s.status === 'available' && s.spot_type !== 'handicap').length,
    occupied:  spots.filter((s: any) => s.status === 'occupied').length,
    reserved:  spots.filter((s: any) => s.status === 'reserved').length,
    ev:        spots.filter((s: any) => s.spot_type === 'ev').length,
    charging:  spots.filter((s: any) => s.spot_type === 'ev' && s.status === 'charging').length,
  }), [spots]);

  return (
    <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
        {[
          { label: 'Total',     val: stats.total,     color: '#3B82F6', emoji: '🅿️' },
          { label: 'Available', val: stats.available, color: '#10B981', emoji: '✅' },
          { label: 'Occupied',  val: stats.occupied,  color: '#EF4444', emoji: '🚗' },
          { label: 'Reserved',  val: stats.reserved,  color: '#F59E0B', emoji: '🔒' },
          { label: 'EV Spots',  val: stats.ev,        color: '#06B6D4', emoji: '🔌' },
          { label: 'Charging',  val: stats.charging,  color: '#8B5CF6', emoji: '⚡' },
        ].map(({ label, val, color, emoji }) => (
          <Card key={label} className="p-3 text-center">
            <div style={{ fontSize: 18, marginBottom: 4 }}>{emoji}</div>
            <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 22, fontWeight: 700, color, lineHeight: 1 }}>{val}</div>
            <div style={{ fontSize: 10, color: '#4A5568', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <SectionHead title="Full Parking Grid" sub={`${filtered.length} of ${spots.length} slots shown · hover for details`} right={<LiveDot />} />
          <div style={{ display: 'flex', gap: 8 }}>
            <Select value={lotFilter} onChange={e => setLotFilter(e.target.value)}>
              <option value="">All Lots</option>
              {lots.map(l => <option key={l as string} value={l as string}>{l as string}</option>)}
            </Select>
            <Select value={floorFilter} onChange={e => setFloorFilter(e.target.value)}>
              <option value="">All Floors</option>
              {floors.map(f => <option key={String(f)} value={String(f)}>Floor {String(f)}</option>)}
            </Select>
          </div>
        </div>

        {/* Filter chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {FILTERS.map(({ label, value, emoji }) => {
            const active = filter === value;
            const count = value === 'all' ? stats.total
              : value === 'ev' ? stats.ev : value === 'charging' ? stats.charging
              : value === 'handicap' ? spots.filter((s: any) => s.spot_type === 'handicap').length
              : spots.filter((s: any) => s.status === value).length;
            return (
              <button key={value} onClick={() => setFilter(value)} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                cursor: 'pointer', border: 'none', transition: 'all .15s',
                background: active ? '#2563EB' : 'rgba(255,255,255,0.04)',
                color: active ? 'white' : '#8A9BAE',
                outline: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}>
                <span>{emoji}</span>
                <span>{label}</span>
                <span style={{ marginLeft: 2, background: 'rgba(255,255,255,0.2)', borderRadius: 100, padding: '1px 6px', fontSize: 10 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Entrance */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          <span style={{ fontSize: 10, color: '#4A5568', textTransform: 'uppercase', letterSpacing: '0.12em' }}>🚗 Entrance / Front</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
        </div>

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(20, 1fr)', gap: 5 }}>
            {[...Array(60)].map((_, i) => <div key={i} className="skeleton rounded-lg" style={{ height: 46 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#4A5568' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
            No slots match the current filter.
          </div>
        ) : (
          <ParkingGrid spots={filtered} cols={20} />
        )}

        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <GridLegend />
        </div>
      </Card>
    </div>
  );
}
