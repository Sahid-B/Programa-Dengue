import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
  AreaChart, Area
} from 'recharts';
import { Activity, ShieldAlert, Heart, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './AnalyticsDashboardPage.module.css';

// ─── Custom Tooltip Components ────────────────────────────────────────────────
const BarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles['tooltip-container']}>
        <p className={styles['tooltip-label']}>{label}</p>
        <p className={styles['tooltip-val-blue']}>{payload[0].value} casos</p>
      </div>
    );
  }
  return null;
};

const PieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className={styles['tooltip-container']}>
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
      <div className={styles['tooltip-container']}>
        <p className={styles['tooltip-label']}>{label}</p>
        <p className={styles['tooltip-val-green']}>{payload[0].value} consultas</p>
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
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" className={styles['pie-label-text']}>
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
    <div
      className={styles['stat-card']}
      style={{
        '--border-color': borderColor,
        '--shadow-color': `${borderColor}22`,
        '--hover-shadow-color': `${borderColor}44`,
        '--accent-color': accentColor
      }}
    >
      <div>
        <p className={styles['stat-label']}>{label}</p>
        <p className={styles['stat-value']}>{value}</p>
        <p className={styles['stat-sub']}>{sub}</p>
      </div>
      <div
        className={styles['icon-wrapper']}
        style={{
          '--accent-color-light': `${accentColor}18`,
          '--accent-color-border': `${accentColor}30`
        }}
      >
        <Icon size={22} style={{ color: accentColor }} />
      </div>
    </div>
  );
}

// ─── Chart Card ──────────────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, style = {} }) {
  return (
    <div className={styles['chart-card']} style={style}>
      <div className={styles['chart-header']}>
        <p className={styles['chart-title']}>{title}</p>
        {subtitle && <p className={styles['chart-subtitle']}>{subtitle}</p>}
      </div>
      <div className={styles['chart-body']}>{children}</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnalyticsDashboardPage({ pacientes = [], stats = {} }) {
  const isLightTheme = document.body.classList.contains('light-theme');
  const axisColor = '#475569';
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

  return (
    <div className={styles['page-container']}>

      {/* ── Stat Cards ── */}
      <div className={styles['stat-cards-grid']}>
        <StatCard label="Total Casos" value={stats.total ?? 0} sub="Casos registrados activos" icon={Activity} accentColor="#38bdf8" borderColor="rgba(56,189,248,0.25)" />
        <StatCard label="Con Signos de Alarma" value={stats.conSignos ?? 0} sub="Requieren observación" icon={AlertTriangle} accentColor="#fb923c" borderColor="rgba(251,146,60,0.25)" />
        <StatCard label="Dengue Grave" value={stats.graves ?? 0} sub="Requieren atención crítica" icon={ShieldAlert} accentColor="#f87171" borderColor="rgba(248,113,113,0.25)" />
        <StatCard label="Estables" value={stats.normales ?? 0} sub="Sin signos de alarma" icon={Heart} accentColor="#34d399" borderColor="rgba(52,211,153,0.25)" />
        <StatCard label="Último Reporte" value={formatDateFull(stats.ultimo_reporte)} sub="Fecha de consulta más reciente" icon={Calendar} accentColor="#c084fc" borderColor="rgba(192,132,252,0.25)" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className={styles['charts-row-1']}>

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
                formatter={(value) => <span className={styles['legend-text']}>{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Severity Radial */}
        <ChartCard title="Severidad" subtitle="% sobre total de casos">
          <div className={styles['severity-list']}>
            {[
              { label: 'Graves', val: stats.graves ?? 0, total: stats.total ?? 1, color: '#f87171' },
              { label: 'Estables', val: stats.normales ?? 0, total: stats.total ?? 1, color: '#34d399' },
            ].map(({ label, val, total, color }) => {
              const pct = total > 0 ? Math.round((val / total) * 100) : 0;
              return (
                <div key={label}>
                  <div className={styles['severity-row']}>
                    <span className={styles['severity-item-label']}>{label}</span>
                    <span className={styles['severity-pct']} style={{ color }}>{pct}%</span>
                  </div>
                  <div className={styles['progress-bar-bg']}>
                    <div
                      className={styles['progress-bar-fill']}
                      style={{
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${color}cc, ${color})`,
                        boxShadow: `0 0 8px ${color}66`
                      }}
                    />
                  </div>
                </div>
              );
            })}
            <div className={styles['severity-total-box']}>
              <div className={styles['severity-total-header']}>
                <TrendingUp size={14} className={styles['severity-total-icon']} />
                <span className={styles['severity-total-title']}>TOTAL</span>
              </div>
              <span className={styles['severity-total-val']}>{stats.total ?? 0}</span>
              <p className={styles['severity-total-sub']}>casos registrados</p>
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
