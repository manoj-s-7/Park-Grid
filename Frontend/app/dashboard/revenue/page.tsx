'use client';
import { useEffect, useState } from 'react';
import { getAnalyticsRevenue, getMonthlyRevenue, mockAnalyticsRevenue, mockRevenue, fmtINR } from '@/lib/api';
import { Card, KpiCard, BarRow, SectionHead, Skeleton } from '@/components/ui';
import RevenueChart from '@/components/dashboard/RevenueChart';

export default function RevenuePage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [monthly, setMonthly] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAnalyticsRevenue(), getMonthlyRevenue()]).then(([a, m]) => {
      setAnalytics((a && !(a as any).error) ? a : mockAnalyticsRevenue());
      setMonthly((Array.isArray(m) && (m as any[]).length) ? m as any[] : mockRevenue());
      setLoading(false);
    });
  }, []);

  const maxVT = analytics ? Math.max(...analytics.by_vehicle_type.map((d: any) => Number(d.revenue) || 0)) : 1;
  const maxPM = analytics ? Math.max(...analytics.by_payment_method.map((d: any) => Number(d.revenue) || 0)) : 1;
  const vtColors: Record<string, string> = { car: '#3B82F6', bike: '#8B5CF6', truck: '#F59E0B' };
  const pmColors: Record<string, string> = { upi: '#10B981', cash: '#F59E0B', card: '#06B6D4' };

  return (
    <div style={{ padding: 24 }}>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
          <KpiCard icon="₹" iconBg="bg-[rgba(37,99,235,0.15)]" iconColor="#3B82F6" label="Total Revenue (12 months)" value={fmtINR(analytics.total_12m)} badge="12 months" badgeVariant="blue" barWidth={90} barColor="#2563EB" />
          <KpiCard icon="📅" iconBg="bg-[rgba(16,185,129,0.12)]" iconColor="#10B981" label="Last Month" value={fmtINR(analytics.last_month)} badge="Previous month" badgeVariant="green" barWidth={65} barColor="#10B981" />
          <KpiCard icon="📊" iconBg="bg-[rgba(245,158,11,0.12)]" iconColor="#F59E0B" label="Last Quarter" value={fmtINR(analytics.last_quarter)} badge="3 months" badgeVariant="yellow" barWidth={78} barColor="#F59E0B" />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>
        <Card className="p-5">
          <SectionHead title="Monthly Revenue" sub="Last 12 months" />
          {loading ? <Skeleton className="h-52" /> : <RevenueChart data={monthly} height={220} />}
        </Card>
        <Card className="p-5">
          <SectionHead title="By Vehicle Type" sub="All time" />
          {loading ? <Skeleton className="h-52" /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
              {analytics.by_vehicle_type.map((d: any) => (
                <BarRow key={d.vehicle_type} label={d.vehicle_type} value={Number(d.revenue) || 0} max={maxVT} color={vtColors[d.vehicle_type] || '#8A9BAE'} sub={`${d.sessions} sessions`} />
              ))}
            </div>
          )}
        </Card>
      </div>
      <Card className="p-5">
        <SectionHead title="By Payment Method" sub="All time" />
        {loading ? <Skeleton className="h-32" /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 8 }}>
            {analytics.by_payment_method.map((d: any) => {
              const pct = maxPM ? Math.round(((Number(d.revenue) || 0) / maxPM) * 100) : 0;
              return (
                <div key={d.payment_method} style={{ background: '#131920', borderRadius: 14, padding: '16px 20px' }}>
                  <div style={{ fontSize: 20, marginBottom: 8 }}>{d.payment_method === 'upi' ? '📱' : d.payment_method === 'cash' ? '💵' : '💳'}</div>
                  <div style={{ fontFamily: 'Syne, sans-serif', fontSize: 20, fontWeight: 700, color: pmColors[d.payment_method] || '#8A9BAE', marginBottom: 4 }}>{fmtINR(d.revenue)}</div>
                  <div style={{ fontSize: 12, color: '#4A5568', textTransform: 'capitalize', marginBottom: 10 }}>{d.payment_method} · {d.cnt} txns</div>
                  <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: pmColors[d.payment_method] || '#8A9BAE', borderRadius: 100 }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
