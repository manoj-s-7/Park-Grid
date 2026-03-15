'use client';
import { ReactNode } from 'react';

// ── BADGE ──────────────────────────────────────────────
type BadgeVariant = 'green'|'red'|'yellow'|'blue'|'cyan'|'purple'|'gray';
const badgeStyles: Record<BadgeVariant, string> = {
  green:  'bg-[rgba(16,185,129,0.12)] text-[#10B981]',
  red:    'bg-[rgba(239,68,68,0.12)] text-[#EF4444]',
  yellow: 'bg-[rgba(245,158,11,0.12)] text-[#F59E0B]',
  blue:   'bg-[rgba(37,99,235,0.15)] text-[#3B82F6]',
  cyan:   'bg-[rgba(6,182,212,0.12)] text-[#06B6D4]',
  purple: 'bg-[rgba(139,92,246,0.12)] text-[#8B5CF6]',
  gray:   'bg-[rgba(107,114,128,0.12)] text-[#9CA3AF]',
};

export function Badge({ variant = 'blue', children, dot }: { variant?: BadgeVariant; children: ReactNode; dot?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium ${badgeStyles[variant]}`}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse-dot" />}
      {children}
    </span>
  );
}

// ── BUTTON ─────────────────────────────────────────────
interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary'|'outline'|'ghost'|'danger';
  size?: 'sm'|'md'|'lg';
  children: ReactNode;
}
const btnVariants = {
  primary: 'bg-[#2563EB] text-white shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:bg-[#3B82F6] hover:shadow-[0_0_28px_rgba(37,99,235,0.45)] hover:-translate-y-px',
  outline: 'bg-transparent text-[#F0F4F8] border border-[rgba(255,255,255,0.1)] hover:bg-[#1C2530]',
  ghost:   'bg-transparent text-[#8A9BAE] hover:bg-[#131920] hover:text-[#F0F4F8]',
  danger:  'bg-[rgba(239,68,68,0.12)] text-[#EF4444] hover:bg-[rgba(239,68,68,0.2)]',
};
const btnSizes = {
  sm: 'px-3.5 py-1.5 text-[13px] rounded-[7px]',
  md: 'px-5 py-2.5 text-[14px] rounded-[9px]',
  lg: 'px-7 py-3.5 text-[15px] rounded-[12px]',
};
export function Btn({ variant='primary', size='md', children, className='', ...props }: BtnProps) {
  return (
    <button
      className={`inline-flex items-center gap-2 font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${btnVariants[variant]} ${btnSizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

// ── CARD ───────────────────────────────────────────────
export function Card({ children, className='' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-[#161D27] border border-[rgba(255,255,255,0.06)] rounded-2xl ${className}`}>
      {children}
    </div>
  );
}

// ── INPUT ──────────────────────────────────────────────
export function Input(props: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  return (
    <input
      {...props}
      className={`w-full bg-[#131920] border border-[rgba(255,255,255,0.06)] rounded-[9px] text-[#F0F4F8] text-sm px-3.5 py-2.5 outline-none placeholder-[#4A5568] transition-all focus:border-[#2563EB] focus:shadow-[0_0_0_3px_rgba(37,99,235,0.2)] ${props.className || ''}`}
    />
  );
}

// ── SELECT ─────────────────────────────────────────────
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement> & { className?: string }) {
  return (
    <select
      {...props}
      className={`bg-[#131920] border border-[rgba(255,255,255,0.06)] rounded-[7px] text-[#8A9BAE] text-xs px-3 py-2 outline-none focus:border-[#2563EB] ${props.className || ''}`}
    />
  );
}

// ── TABLE ──────────────────────────────────────────────
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">{children}</table>
    </div>
  );
}
export function Thead({ children }: { children: ReactNode }) {
  return <thead className="bg-[#131920] border-b border-[rgba(255,255,255,0.06)]">{children}</thead>;
}
export function Th({ children }: { children: ReactNode }) {
  return <th className="text-left text-[11px] font-medium text-[#4A5568] px-5 py-2.5 uppercase tracking-wider whitespace-nowrap">{children}</th>;
}
export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr
      className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[#131920] transition-colors last:border-0 cursor-default"
      onClick={onClick}
    >{children}</tr>
  );
}
export function Td({ children, className='' }: { children: ReactNode; className?: string }) {
  return <td className={`px-5 py-2.5 text-sm text-[#8A9BAE] whitespace-nowrap ${className}`}>{children}</td>;
}

// ── SKELETON ───────────────────────────────────────────
export function Skeleton({ className='' }: { className?: string }) {
  return <div className={`skeleton ${className}`} />;
}

// ── KPI CARD ───────────────────────────────────────────
interface KpiProps {
  icon: string; iconBg: string; iconColor: string;
  label: string; value: string;
  badge?: string; badgeVariant?: BadgeVariant;
  barWidth?: number; barColor?: string;
}
export function KpiCard({ icon, iconBg, iconColor, label, value, badge, badgeVariant='blue', barWidth=70, barColor='#2563EB' }: KpiProps) {
  return (
    <Card className="p-5 relative overflow-hidden hover:border-[rgba(255,255,255,0.10)] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base ${iconBg}`} style={{ color: iconColor }}>{icon}</div>
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
      </div>
      <div className="font-display text-[28px] font-bold text-[#F0F4F8] mb-1 leading-none">{value}</div>
      <div className="text-xs text-[#4A5568] mb-3">{label}</div>
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[rgba(255,255,255,0.04)]">
        <div className="h-full rounded-r transition-all duration-1000" style={{ width: `${barWidth}%`, background: barColor }} />
      </div>
    </Card>
  );
}

// ── SECTION HEADER ─────────────────────────────────────
export function SectionHead({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="font-display text-sm font-semibold text-[#F0F4F8]">{title}</h3>
        {sub && <p className="text-xs text-[#4A5568] mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

// ── LIVE DOT ────────────────────────────────────────────
export function LiveDot({ label = 'Live' }: { label?: string }) {
  return (
    <Badge variant="green" dot>{label}</Badge>
  );
}

// ── TABS ───────────────────────────────────────────────
export function Tabs({ items, active, onChange }: { items: string[]; active: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-0.5 bg-[#131920] rounded-lg p-1">
      {items.map(item => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${active === item ? 'bg-[#161D27] text-[#F0F4F8] shadow-sm' : 'text-[#4A5568] hover:text-[#8A9BAE]'}`}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

// ── BAR CHART ROW ──────────────────────────────────────
export function BarRow({ label, value, max, color, sub }: { label: string; value: number; max: number; color: string; sub?: string }) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <span className="text-sm font-medium capitalize">{label}</span>
        <span className="text-sm font-semibold">{value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-[#131920] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${max ? (value/max)*100 : 0}%`, background: color }} />
      </div>
      {sub && <p className="text-[11px] text-[#4A5568] mt-1">{sub}</p>}
    </div>
  );
}
