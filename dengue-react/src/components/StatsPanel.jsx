import React from 'react';
import { BarChart3, ShieldAlert, Heart, Calendar, Activity } from 'lucide-react';
import ExpandableBentoGrid from './ExpandableBentoGrid';

export default function StatsPanel({ stats, pacientes = [], hasCases }) {
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const [y, m, d] = dateString.split('-');
    return `${d}/${m}/${y}`;
  };

  const gravePatients = pacientes.filter(p => p.nivel_gravedad === 'grave');
  const normalPatients = pacientes.filter(p => p.nivel_gravedad === 'normal');
  const latestPatient = pacientes.length > 0 ? pacientes[0] : null;

  const bentoItems = [
    {
      id: 'total',
      title: 'Total Casos',
      subtitle: `${stats.total || 0} Registrados`,
      description: 'Acumulado total de casos reportados en el período.',
      icon: <Activity size={24} style={{ color: 'var(--primary)' }} />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Distribución de casos por sector en La Concordia:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
            {(stats.por_barrio || []).map((b, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.25rem', fontSize: '0.8rem' }}>
                <span>{b.barrio}</span>
                <span style={{ fontWeight: 'bold', color: 'var(--primary)' }}>{b.total} casos</span>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'graves',
      title: 'Graves',
      subtitle: `${stats.graves || 0} de alarma`,
      description: 'Pacientes que requieren monitoreo crítico.',
      icon: <ShieldAlert size={24} style={{ color: 'var(--accent-red)' }} />,
      className: 'neon-red',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Pacientes graves registrados en el período:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
            {gravePatients.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No hay pacientes graves en este período.</div>
            ) : (
              gravePatients.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-red)' }}>{p.nombre_completo}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {p.nombre_enfermedad} | Barrio: {p.direccion_barrio} | Unidad: {p.unidad_operativa}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )
    },
    {
      id: 'normales',
      title: 'Sin Signos',
      subtitle: `${stats.normales || 0} estables`,
      description: 'Pacientes estables bajo monitoreo regular.',
      icon: <Heart size={24} style={{ color: 'var(--accent-green)' }} />,
      className: 'neon-green',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>Pacientes sin signos de alarma activos:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '150px', overflowY: 'auto' }}>
            {normalPatients.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No hay pacientes estables en este período.</div>
            ) : (
              normalPatients.map((p, idx) => (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '0.35rem', fontSize: '0.8rem' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-green)' }}>{p.nombre_completo}</span>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                    {p.nombre_enfermedad} | Barrio: {p.direccion_barrio} | Unidad: {p.unidad_operativa}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )
    },
    {
      id: 'ultimo',
      title: 'Último Reporte',
      subtitle: formatDate(stats.ultimo_reporte),
      description: 'Último caso registrado en la base de datos.',
      icon: <Calendar size={24} style={{ color: 'var(--accent-purple)' }} />,
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
          {latestPatient ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'var(--text-secondary)' }}>Paciente:</span> <strong style={{ color: 'var(--primary)' }}>{latestPatient.nombre_completo}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Edad / Sexo:</span> <span>{latestPatient.edad} años | {latestPatient.sexo}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Enfermedad:</span> <span>{latestPatient.nombre_enfermedad} ({latestPatient.cie_10})</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Barrio:</span> <span>{latestPatient.direccion_barrio}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Fecha Consulta:</span> <span>{formatDate(latestPatient.fecha_consulta)}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>Unidad Operativa:</span> <span>{latestPatient.unidad_operativa}</span></div>
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No hay reportes disponibles.</div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="sidebar">
      <div>
        <h2>
          <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
          Estadísticas en Tiempo Real
        </h2>
      </div>

      <ExpandableBentoGrid items={bentoItems} />

      {!hasCases && (
        <div style={{
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(239, 68, 68, 0.05)',
          border: '1px solid rgba(239, 68, 68, 0.1)',
          color: 'var(--accent-red)',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          No hay casos para el período seleccionado
        </div>
      )}

      {hasCases && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
              Casos por Barrio
            </h3>
            <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <table className="barrios-table" style={{ margin: 0 }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', top: 0, background: 'rgba(12,12,16,0.95)', backdropFilter: 'var(--blur)' }}>Barrio</th>
                    <th style={{ position: 'sticky', top: 0, background: 'rgba(12,12,16,0.95)', backdropFilter: 'var(--blur)' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.por_barrio || []).slice(0, 5).map((b, idx) => (
                    <tr key={idx}>
                      <td>{b.barrio}</td>
                      <td style={{ fontWeight: 'bold' }}>{b.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.5rem', fontWeight: '600' }}>
              Casos por Enfermedad
            </h3>
            <ul className="enfermedades-list">
              {(stats.por_enfermedad || []).map((e, idx) => (
                <li key={idx} style={{ padding: '0.25rem 0' }}>
                  <span className="color-dot" style={{ backgroundColor: e.color_mapa || 'var(--primary)' }}></span>
                  <span style={{ flex: 1 }}>{e.nombre}</span>
                  <span style={{ fontWeight: 'bold', color: 'var(--text-secondary)' }}>({e.total})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
