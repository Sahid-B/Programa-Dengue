import React from 'react';
import styles from './UnderConstructionPage.module.css';

const WrenchIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const BackIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7"/>
  </svg>
);

const features = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 12h6M9 16h6M9 8h6M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
      </svg>
    ),
    label: 'Registro de fumigaciones'
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    label: 'Zonas de intervención'
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    label: 'Reportes de cobertura'
  }
];

export default function UnderConstructionPage({ onBack }) {
  return (
    <div className={styles['uc-container']}>
      <div className={styles['uc-bg']}>
        <div className={`${styles['uc-circle']} ${styles.c1}`}></div>
        <div className={`${styles['uc-circle']} ${styles.c2}`}></div>
      </div>
      <div className={styles['uc-grid']}></div>

      <div className={styles['uc-content']}>
        <div className={styles['uc-text']}>
          <h1 className={styles['uc-title']}>En Construcción</h1>
          <p className={styles['uc-subtitle']}>Control de Vectores</p>
          <p className={styles['uc-desc']}>
            Este módulo está siendo desarrollado activamente. Pronto estará disponible
            con todas las funcionalidades de gestión vectorial.
          </p>
        </div>

        {/* Back button */}
        <button className={styles['uc-back-btn']} onClick={onBack} id="btn-back-from-construction">
          <BackIcon />
          Volver al inicio
        </button>
      </div>
    </div>
  );
}
