'use client';
import {
  ComposedChart, Bar, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

interface RevenueData { month: string; revenue: number; sessions: number; }

const MONTH_LABELS: Record<string, string> = {
  '01':'Jan','02':'Feb','03':'Mar','04':'Apr','05':'May','06':'Jun',
  '07':'Jul','08':'Aug','09':'Sep','10':'Oct','11':'Nov','12':'Dec',
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  const monthKey = d?.month?.slice(5);
  const rev = Number(d?.revenue) || 0;
  const ses = Number(d?.sessions) || 0;
  return (
    <div style={{
      background: '#0F1923',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 12, padding: '12px 16px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
      minWidth: 148,
    }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#F0F4F8', marginBottom: 8, fontFamily: 'Syne, sans-serif' }}>
        {MONTH_LABELS[monthKey] || d?.month}
      </p>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: '#3B82F6', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#8A9BAE' }}>Revenue</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#10B981', marginLeft: 'auto' }}>
          ₹{rev.toLocaleString('en-IN')}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B', flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: '#8A9BAE' }}>Sessions</span>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#F59E0B', marginLeft: 'auto' }}>{ses}</span>
      </div>
    </div>
  );
}

/* Custom bar shape — rounded top, glow effect */
function GlowBar(props: any) {
  const { x, y, width, height, fill, glowColor } = props;
  if (!height || height <= 0) return null;
  const radius = Math.min(5, width / 2);
  return (
    <g>
      {/* Glow rectangle behind the bar */}
      <rect
        x={x + width * 0.1}
        y={y + 4}
        width={width * 0.8}
        height={height}
        fill={glowColor || fill}
        opacity={0.18}
        rx={radius}
        filter="blur(4px)"
      />
      {/* Actual bar with rounded top */}
      <path
        d={`M${x + radius},${y} H${x + width - radius} Q${x + width},${y} ${x + width},${y + radius} V${y + height} H${x} V${y + radius} Q${x},${y} ${x + radius},${y}`}
        fill={fill}
      />
    </g>
  );
}

export default function RevenueChart({ data, height = 240 }: { data: RevenueData[]; height?: number }) {
  const last12 = data.slice(-12);

  // Empty state — no data at all
  if (!last12.length) {
    return (
      <div style={{ height, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>📊</div>
        <p style={{ fontSize: 12, color: '#4A5568', textAlign: 'center' }}>
          No revenue data yet.<br />Complete some sessions to see charts.
        </p>
      </div>
    );
  }

  // Pad months that have no data so the chart always shows 12 columns
  const allMonths = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  const currentYear = last12[0]?.month?.slice(0, 4) || new Date().getFullYear().toString();
  const dataMap = new Map(last12.map(d => [d.month?.slice(5), d]));
  const padded = allMonths.map(m => dataMap.get(m) || { month: `${currentYear}-${m}`, revenue: 0, sessions: 0 });

  const max = Math.max(...padded.map(d => Number(d.revenue) || 0), 1);

  // Assign each bar a colour based on whether it's the peak, growth or neutral
  const barColors = padded.map((d, i) => {
    const rev = Number(d.revenue) || 0;
    if (rev === 0) return { fill: 'rgba(255,255,255,0.06)', glow: 'rgba(255,255,255,0.04)' };
    if (rev === max) return { fill: '#10B981', glow: '#10B981' };           // peak → green
    const prev = Number(padded[i - 1]?.revenue) || 0;
    if (i > 0 && rev > prev) return { fill: '#3B82F6', glow: '#3B82F6' };  // growth → blue
    if (i > 0 && rev < prev) return { fill: '#EF4444', glow: '#EF4444' };  // decline → red
    return { fill: '#6366F1', glow: '#6366F1' };                             // neutral → indigo
  });

  return (
    <div style={{ height, width: '100%', position: 'relative' }}>
      {/* Legend */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 10 }}>
        {[
          { color: '#10B981', label: 'Peak month' },
          { color: '#3B82F6', label: 'Growth'     },
          { color: '#EF4444', label: 'Decline'    },
          { color: '#6366F1', label: 'Neutral'    },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
            <span style={{ fontSize: 10, color: '#4A5568' }}>{label}</span>
          </div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={height - 28}>
        <ComposedChart
          data={padded}
          margin={{ top: 4, right: 4, bottom: 0, left: -14 }}
          barCategoryGap="28%"
        >
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#3B82F6" stopOpacity={0.18} />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0}    />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(255,255,255,0.04)"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            tickFormatter={v => MONTH_LABELS[v?.slice(5)] || ''}
            tick={{ fill: '#4A5568', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fill: '#4A5568', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)}
            width={34}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: 'rgba(255,255,255,0.03)', radius: 6 }}
          />

          {/* Area overlay for trend line */}
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={1.5}
            strokeDasharray="4 2"
            fill="url(#areaGrad)"
            dot={false}
            activeDot={{
              r: 5, fill: '#3B82F6',
              stroke: '#F0F4F8', strokeWidth: 2,
            }}
          />

          {/* Colour-coded bars with glow */}
          <Bar dataKey="revenue" shape={(props: any) => {
            const idx = padded.findIndex(d => d.month === props?.month);
            const c = barColors[props?.index ?? idx] || barColors[0];
            return <GlowBar {...props} fill={c.fill} glowColor={c.glow} />;
          }} radius={[5, 5, 0, 0]}>
            {padded.map((_, i) => (
              <Cell
                key={i}
                fill={barColors[i]?.fill || 'rgba(255,255,255,0.06)'}
              />
            ))}
          </Bar>

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
