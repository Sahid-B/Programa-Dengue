import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area,
  RadialBarChart, RadialBar
} from 'recharts';
import { Activity, ShieldAlert, Heart, Calendar, TrendingUp } from 'lucide-react';

// ─── Custom Tooltip Components ────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(56, 189, 248, 0.3)',
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        color: '#f8fafc',
        fontSize: '0.8rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(56, 189, 248, 0.15)'
      }}>
        <p style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: '#38bdf8', fontWeight: 700 }}>{payload[0].value} casos</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.92)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        fontSize: '0.8rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        <p style={{ color: payload[0].payload.fill, fontWeight: 700 }}>{payload[0].name}</p>
        <p style={{ color: '#f8fafc' }}>{payload[0].value} casos</p>
      </div>
    );
  }
  return null;
};

const LineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid rgba(52, 211, 153, 0.3)',
        borderRadius: '10px',
        padding: '0.6rem 1rem',
        color: '#f8fafc',
        fontSize: '0.8rem',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(52, 211, 153, 0.1)'
      }}>
        <p style={{ color: '#94a3b8', marginBottom: '0.25rem' }}>{label}</p>
        <p style={{ color: '#34d399', fontWeight: 700 }}>{payload[0].value} consultas</p>
      </div>
    );
  }
  return null;
};

// ─── Custom Label for Pie ─────────────────────────────────────────────────────
const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: '0.72rem', fontWeight: 700, pointerEvents: 'none' }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ─── Gradient defs ────────────────────────────────────────────────────────────
function GradientDefs() {
  return (
    <defs>
      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#34d399" stopOpacity={0.35} />
        <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
      </linearGradient>
      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.95} />
        <stop offset="100%" stopColor="#0369a1" stopOpacity={0.6} />
      </linearGradient>
    </defs>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accentColor, borderColor }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.6) 100%)',
      border: `1px solid ${borderColor}`,
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '1rem',
      backdropFilter: 'blur(16px)',
      boxShadow: `0 4px 24px ${borderColor}22`,
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 12px 36px ${borderColor}44`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `0 4px 24px ${borderColor}22`; }}
    >
      <div>
        <p style={{ fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: accentColor, fontWeight: 700, margin: '0 0 0.35rem 0' }}>{label}</p>
        <p style={{ fontSize: '2.4rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1, margin: '0 0 0.35rem 0', fontFamily: 'var(--font-title)' }}>{value}</p>
        <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>{sub}</p>
      </div>
      <div style={{
        width: '46px', height: '46px', borderRadius: '14px',
        background: `${accentColor}18`,
        border: `1px solid ${accentColor}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0
      }}>
        <Icon size={22} style={{ color: accentColor }} />
      </div>
    </div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(22,33,52,0.85) 0%, rgba(11,18,36,0.85) 100%)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '20px',
      padding: '1.25rem 1.5rem',
      backdropFilter: 'blur(16px)',
      display: 'flex',
      flexDirection: 'column',
      ...style
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#f1f5f9', fontFamily: 'var(--font-title)' }}>{title}</p>
        {subtitle && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.75rem', color: '#475569' }}>{subtitle}</p>}
      </div>
      <div style={{ flex: 1, minHeight: 0 }}>{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboardPage({ pacientes = [], stats = {} }) {
  const isLightTheme = document.body.classList.contains('light-theme');
  const axisColor = isLightTheme ? '#475569' : '#475569';
  const gridColor = isLightTheme ? 'rgba(15,23,42,0.06)' : 'rgba(255,255,255,0.05)';

  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}`;
  };

  const formatDateFull = (dateString) => {
    if (!dateString) return '--';
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  };

  // Bar chart data
  const barData = useMemo(() => (stats.por_barrio || []).slice(0, 12).map(b => ({
    barrio: b.barrio.replace(/^Barrio\s+/i, '').substring(0, 14),
    casos: b.total
  })), [stats.por_barrio]);

  // Pie chart data
  const pieData = useMemo(() => (stats.por_enfermedad || []).map(e => ({
    name: e.nombre,
    value: e.total,
    fill: e.color_mapa || '#38bdf8'
  })), [stats.por_enfermedad]);

  // Line chart data
  const lineData = useMemo(() => {
    const map = {};
    [...pacientes]
      .sort((a, b) => new Date(a.fecha_consulta) - new Date(b.fecha_consulta))
      .forEach(p => {
        if (p.fecha_consulta) {
          map[p.fecha_consulta] = (map[p.fecha_consulta] || 0) + 1;
        }
      });
    return Object.entries(map).map(([date, val]) => ({ fecha: formatDate(date), consultas: val }));
  }, [pacientes]);

  // Radial / Severity data
  const severityData = useMemo(() => {
    const total = stats.total || 1;
    return [
      { name: 'Graves', value: Math.round(((stats.graves || 0) / total) * 100), fill: '#f87171' },
      { name: 'Estables', value: Math.round(((stats.normales || 0) / total) * 100), fill: '#34d399' },
    ];
  }, [stats]);

  // Bar colors with gradient
  const BAR_COLORS = ['#38bdf8', '#7dd3fc', '#0ea5e9', '#38bdf8', '#0369a1', '#075985', '#0c4a6e'];

  return (
    <div style={{ flex: 1, padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '1rem' }}>
        <StatCard label="Total Casos" value={stats.total ?? 0} sub="Casos registrados activos" icon={Activity} accentColor="#38bdf8" borderColor="rgba(56,189,248,0.25)" />
        <StatCard label="Casos Graves" value={stats.graves ?? 0} sub="Requieren atención crítica" icon={ShieldAlert} accentColor="#f87171" borderColor="rgba(248,113,113,0.25)" />
        <StatCard label="Estables" value={stats.normales ?? 0} sub="Sin signos de alarma" icon={Heart} accentColor="#34d399" borderColor="rgba(52,211,153,0.25)" />
        <StatCard label="Último Reporte" value={formatDateFull(stats.ultimo_reporte)} sub="Fecha de consulta más reciente" icon={Calendar} accentColor="#c084fc" borderColor="rgba(192,132,252,0.25)" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 0.65fr', gap: '1.25rem', minHeight: '300px' }}>

        {/* Bar Chart */}
        <ChartCard title="Distribución por Barrio" subtitle="Casos registrados por sector geográfico">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} margin={{ top: 5, right: 5, left: -25, bottom: 48 }} barSize={18}>
              <GradientDefs />
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="barrio" tick={{ fill: axisColor, fontSize: 10 }} angle={-40} textAnchor="end" interval={0} />
              <YAxis tick={{ fill: axisColor, fontSize: 10 }} allowDecimals={false} />
              <Tooltip content={<BarTooltip />} />
              <Bar dataKey="casos" radius={[6, 6, 0, 0]}>
                {barData.map((_, i) => (
                  <Cell key={i} fill={`url(#barGradient)`} opacity={0.85 + (i % 3) * 0.05} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Pie Chart */}
        <ChartCard title="Por Tipo de Diagnóstico" subtitle="Distribución de enfermedades registradas">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="48%"
                innerRadius={52}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderPieLabel}
                strokeWidth={0}
              >
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '0.72rem', color: axisColor, paddingTop: '4px' }}
                formatter={(value) => <span style={{ color: isLightTheme ? '#334155' : '#94a3b8' }}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Severity Radial */}
        <ChartCard title="Severidad" subtitle="% sobre total de casos">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingTop: '0.5rem' }}>
            {[
              { label: 'Graves', val: stats.graves ?? 0, total: stats.total ?? 1, color: '#f87171' },
              { label: 'Estables', val: stats.normales ?? 0, total: stats.total ?? 1, color: '#34d399' },
            ].map(({ label, val, total, color }) => {
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return (
                <div key={label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{label}</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color }}>{pct}%</span>
                  </div>
                  <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: `linear-gradient(90deg, ${color}cc, ${color})`,
                      borderRadius: '99px',
                      transition: 'width 0.8s ease',
                      boxShadow: `0 0 8px ${color}66`
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{
              marginTop: '0.75rem',
              padding: '0.75rem',
              background: 'rgba(56,189,248,0.06)',
              border: '1px solid rgba(56,189,248,0.12)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                <TrendingUp size={14} style={{ color: '#38bdf8' }} />
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 700 }}>TOTAL</span>
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', fontFamily: 'var(--font-title)' }}>{stats.total ?? 0}</span>
              <p style={{ margin: '0.1rem 0 0', fontSize: '0.7rem', color: '#475569' }}>casos registrados</p>
            </div>
          </div>
        </ChartCard>

      </div>

      {/* ── Line Chart Row 2 ── */}
      <ChartCard title="Curva Epidemiológica" subtitle="Tendencia de nuevas consultas por fecha de atención" style={{ minHeight: '240px' }}>
        <ResponsiveContainer width="100%" height={185}>
          <AreaChart data={lineData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
            <GradientDefs />
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="fecha" tick={{ fill: axisColor, fontSize: 10 }} />
            <YAxis allowDecimals={false} tick={{ fill: axisColor, fontSize: 10 }} />
            <Tooltip content={<LineTooltip />} />
            <Area
              type="monotone"
              dataKey="consultas"
              stroke="#34d399"
              strokeWidth={2.5}
              fill="url(#areaGradient)"
              dot={{ fill: '#34d399', r: 4, strokeWidth: 2, stroke: '#0b0f19' }}
              activeDot={{ r: 6, fill: '#34d399', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

    </div>
  );
}
