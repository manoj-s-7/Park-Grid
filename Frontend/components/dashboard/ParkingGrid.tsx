'use client';
import { useState } from 'react';

interface Spot {
  id: number;
  spot_number: string;
  spot_type: string;
  status: string;
  floor: number;
  lot_name: string;
}

interface TooltipState { spot: Spot; x: number; y: number; }

function getSpotEmoji(spot: Spot): string {
  if (spot.spot_type === 'handicap') return '♿';
  if (spot.spot_type === 'vip') return spot.status === 'occupied' ? '⭐' : '⭐';
  if (spot.spot_type === 'ev' && spot.status === 'charging') return '⚡';
  if (spot.spot_type === 'ev') return '🔌';
  if (spot.status === 'occupied') return ['🚗','🚙','🚕'][spot.id % 3];
  if (spot.status === 'reserved') return '🔒';
  if (spot.status === 'maintenance') return '🔧';
  return '✅';
}

function getSpotStyle(spot: Spot): { bg: string; border: string; glow: string; text: string; label: string } {
  if (spot.spot_type === 'handicap')
    return { bg: 'rgba(107,114,128,.12)', border: 'rgba(107,114,128,.3)', glow: '', text: '#6B7280', label: '#9CA3AF' };
  if (spot.spot_type === 'vip' && spot.status === 'available')
    return { bg: 'rgba(245,158,11,.12)', border: 'rgba(245,158,11,.4)', glow: '', text: '#F59E0B', label: '#FCD34D' };
  if (spot.spot_type === 'vip')
    return { bg: 'rgba(245,158,11,.18)', border: 'rgba(245,158,11,.55)', glow: '', text: '#F59E0B', label: '#FCD34D' };
  if (spot.spot_type === 'ev' && spot.status === 'charging')
    return { bg: 'rgba(6,182,212,.22)', border: 'rgba(6,182,212,.75)', glow: '0 0 10px rgba(6,182,212,.4)', text: '#06B6D4', label: '#22D3EE' };
  if (spot.spot_type === 'ev')
    return { bg: 'rgba(6,182,212,.10)', border: 'rgba(6,182,212,.4)', glow: '', text: '#0E7490', label: '#06B6D4' };
  if (spot.status === 'occupied')
    return { bg: 'rgba(239,68,68,.16)', border: 'rgba(239,68,68,.5)', glow: '', text: '#EF4444', label: '#F87171' };
  if (spot.status === 'reserved')
    return { bg: 'rgba(245,158,11,.15)', border: 'rgba(245,158,11,.5)', glow: '', text: '#F59E0B', label: '#FCD34D' };
  if (spot.status === 'maintenance')
    return { bg: 'rgba(107,114,128,.12)', border: 'rgba(107,114,128,.3)', glow: '', text: '#6B7280', label: '#9CA3AF' };
  // available — regular
  return { bg: 'rgba(16,185,129,.10)', border: 'rgba(16,185,129,.35)', glow: '', text: '#10B981', label: '#6EE7B7' };
}

export default function ParkingGrid({
  spots,
  cols = 20,
  compact = false,
}: {
  spots: Spot[];
  cols?: number;
  compact?: boolean;
}) {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);
  const cellSize = compact ? 38 : 46;
  const gap      = compact ? 5 : 6;

  return (
    <div className="relative">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
          gap,
          overflowX: 'auto',
        }}
      >
        {spots.map((spot) => {
          const emoji = getSpotEmoji(spot);
          const { bg, border, glow, text, label } = getSpotStyle(spot);
          const isCharging = spot.spot_type === 'ev' && spot.status === 'charging';
          const isDisabled = spot.spot_type === 'disabled';
          const shortNum   = spot.spot_number.replace(/^[A-Z]/, '').replace(/^0+/, '') || spot.spot_number.slice(-3);

          return (
            <div
              key={spot.id}
              onMouseEnter={(e) => {
                const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ spot, x: r.right + 10, y: r.top - 10 });
              }}
              onMouseLeave={() => setTooltip(null)}
              style={{
                width: cellSize,
                height: cellSize + 8,
                borderRadius: 7,
                background: bg,
                border: `1.5px solid ${border}`,
                boxShadow: glow || 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                opacity: isDisabled ? 0.4 : 1,
                transition: 'transform .1s, box-shadow .1s',
                position: 'relative',
                overflow: 'hidden',
                animation: isCharging ? 'bmsGlow 2s ease-in-out infinite' : 'none',
              }}
              onMouseOver={(e) => {
                if (!isDisabled) {
                  (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.1)';
                  (e.currentTarget as HTMLDivElement).style.zIndex   = '20';
                }
              }}
              onMouseOut={(e) => {
                (e.currentTarget as HTMLDivElement).style.transform = '';
                (e.currentTarget as HTMLDivElement).style.zIndex    = '';
              }}
            >
              {/* top gloss sheen */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '38%',
                background: 'linear-gradient(180deg,rgba(255,255,255,0.07) 0%,transparent 100%)',
                borderRadius: '7px 7px 0 0', pointerEvents: 'none',
              }} />
              <span style={{ fontSize: compact ? 11 : 14, lineHeight: 1 }}>{emoji}</span>
              <span style={{
                fontSize: compact ? 7 : 8,
                fontWeight: 700,
                color: label,
                lineHeight: 1,
                letterSpacing: '-0.01em',
                fontFamily: 'monospace',
              }}>
                {shortNum}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes bmsGlow {
          0%,100% { box-shadow: 0 0 6px rgba(6,182,212,.3); }
          50%      { box-shadow: 0 0 16px rgba(6,182,212,.7), 0 0 4px rgba(6,182,212,.5); }
        }
      `}</style>

      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-xl shadow-2xl"
          style={{
            left: tooltip.x, top: tooltip.y,
            minWidth: 170,
            background: '#0F1923',
            border: '1px solid rgba(255,255,255,0.10)',
            padding: '10px 14px',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: '#F0F4F8', marginBottom: 7 }}>
            {getSpotEmoji(tooltip.spot)} {tooltip.spot.spot_number}
          </p>
          {[
            ['Status',  tooltip.spot.status],
            ['Type',    tooltip.spot.spot_type],
            ['Floor',   `Floor ${tooltip.spot.floor || 1}`],
            ['Lot',     tooltip.spot.lot_name],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 3 }}>
              <span style={{ fontSize: 11, color: '#4A5568' }}>{k}</span>
              <span style={{ fontSize: 11, color: '#CBD5E1', fontWeight: 600, textTransform: 'capitalize' }}>{v}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function GridLegend() {
  const items = [
    { emoji: '✅', label: 'Available',   bg: 'rgba(16,185,129,.12)',  bc: 'rgba(16,185,129,.4)' },
    { emoji: '🚗', label: 'Occupied',    bg: 'rgba(239,68,68,.14)',   bc: 'rgba(239,68,68,.45)' },
    { emoji: '🔒', label: 'Reserved',    bg: 'rgba(245,158,11,.14)',  bc: 'rgba(245,158,11,.45)' },
    { emoji: '🔌', label: 'EV',          bg: 'rgba(6,182,212,.12)',   bc: 'rgba(6,182,212,.4)' },
    { emoji: '⚡', label: 'Charging',    bg: 'rgba(6,182,212,.22)',   bc: 'rgba(6,182,212,.7)' },
    { emoji: '⭐', label: 'VIP',         bg: 'rgba(245,158,11,.12)',  bc: 'rgba(245,158,11,.4)' },
    { emoji: '♿', label: 'Handicap',    bg: 'rgba(107,114,128,.1)',  bc: 'rgba(107,114,128,.3)' },
    { emoji: '🔧', label: 'Maintenance', bg: 'rgba(107,114,128,.08)', bc: 'rgba(107,114,128,.2)' },
  ];
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', marginTop: 4 }}>
      {items.map(({ emoji, label, bg, bc }) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{
            width: 24, height: 20, borderRadius: 4,
            background: bg, border: `1.5px solid ${bc}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
          }}>
            {emoji}
          </div>
          <span style={{ fontSize: 11, color: '#8A9BAE' }}>{label}</span>
        </div>
      ))}
    </div>
  );
}
