import React from 'react';
import { BarChart3, ShieldAlert, Heart, Calendar, Activity } from 'lucide-react';
import ExpandableBentoGrid from '../ExpandableBentoGrid/ExpandableBentoGrid';
import styles from './StatsPanel.module.css';

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
      icon: <Activity size={24} className={styles['icon-primary']} />,
      content: (
        <div className={styles['flex-column']}>
          <p className={styles['label-text']}>Distribución de casos por sector en La Concordia:</p>
          <div className={styles['list-container']}>
            {(stats.por_barrio || []).map((b, idx) => (
              <div key={idx} className={styles['list-item']}>
                <span>{b.barrio}</span>
                <span className={styles['bold-primary']}>{b.total} casos</span>
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
      icon: <ShieldAlert size={24} className={styles['icon-red']} />,
      className: 'neon-red',
      content: (
        <div className={styles['flex-column']}>
          <p className={styles['label-text']}>Pacientes graves registrados en el período:</p>
          <div className={styles['list-container']}>
            {gravePatients.length === 0 ? (
              <div className={styles['text-muted-small']}>No hay pacientes graves en este período.</div>
            ) : (
              gravePatients.map((p, idx) => (
                <div key={idx} className={styles['list-item-column']}>
                  <span className={styles['bold-red']}>{p.nombre_completo}</span>
                  <span className={styles['sub-text']}>
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
      icon: <Heart size={24} className={styles['icon-green']} />,
      className: 'neon-green',
      content: (
        <div className={styles['flex-column']}>
          <p className={styles['label-text']}>Pacientes sin signos de alarma activos:</p>
          <div className={styles['list-container']}>
            {normalPatients.length === 0 ? (
              <div className={styles['text-muted-small']}>No hay pacientes estables en este período.</div>
            ) : (
              normalPatients.map((p, idx) => (
                <div key={idx} className={styles['list-item-column']}>
                  <span className={styles['bold-green']}>{p.nombre_completo}</span>
                  <span className={styles['sub-text']}>
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
      icon: <Calendar size={24} className={styles['icon-purple']} />,
      content: (
        <div className={styles['flex-column']}>
          {latestPatient ? (
            <div className={styles['latest-patient-details']}>
              <div><span className={styles['patient-label']}>Paciente:</span> <strong className={styles['patient-value']}>{latestPatient.nombre_completo}</strong></div>
              <div><span className={styles['patient-label']}>Edad / Sexo:</span> <span>{latestPatient.edad} años | {latestPatient.sexo}</span></div>
              <div><span className={styles['patient-label']}>Enfermedad:</span> <span>{latestPatient.nombre_enfermedad} ({latestPatient.cie_10})</span></div>
              <div><span className={styles['patient-label']}>Barrio:</span> <span>{latestPatient.direccion_barrio}</span></div>
              <div><span className={styles['patient-label']}>Fecha Consulta:</span> <span>{formatDate(latestPatient.fecha_consulta)}</span></div>
              <div><span className={styles['patient-label']}>Unidad Operativa:</span> <span>{latestPatient.unidad_operativa}</span></div>
            </div>
          ) : (
            <div className={styles['text-muted-small']}>No hay reportes disponibles.</div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="sidebar">
      <div>
        <h2>
          <BarChart3 size={18} className={styles['title-icon']} />
          Estadísticas en Tiempo Real
        </h2>
      </div>

      <ExpandableBentoGrid items={bentoItems} />

      {!hasCases && (
        <div className={styles['no-cases-alert']}>
          No hay casos para el período seleccionado
        </div>
      )}

      {hasCases && (
        <div className={styles['extra-stats-container']}>
          <div>
            <h3 className={styles['stats-section-title']}>
              Casos por Barrio
            </h3>
            <div className={styles['table-scroll-container']}>
              <table className={`barrios-table ${styles['table-no-margin']}`}>
                <thead>
                  <tr>
                    <th className={styles['th-sticky']}>Barrio</th>
                    <th className={styles['th-sticky']}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(stats.por_barrio || []).slice(0, 5).map((b, idx) => (
                    <tr key={idx}>
                      <td>{b.barrio}</td>
                      <td className={styles['bold-bold']}>{b.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className={styles['stats-section-title']}>
              Casos por Enfermedad
            </h3>
            <ul className="enfermedades-list">
              {(stats.por_enfermedad || []).map((e, idx) => (
                <li key={idx} className={styles['list-item-padding']}>
                  <span className="color-dot" style={{ backgroundColor: e.color_mapa || 'var(--primary)' }}></span>
                  <span style={{ flex: 1 }}>{e.nombre}</span>
                  <span className={styles['text-secondary-bold']}>({e.total})</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
