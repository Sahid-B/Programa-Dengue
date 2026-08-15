import React from 'react';
import styles from './LandingPage.module.css';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import { LogOut } from 'lucide-react';

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 20L3 17V4L9 7M9 20L15 17M9 20V7M15 17L21 20V7L15 4M15 17V4M9 7L15 4"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ShieldIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 6V12C4 16.418 7.582 20.328 12 22C16.418 20.328 20 16.418 20 12V6L12 2Z"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12L11 14L15 10"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const anioActual = new Date().getFullYear();

export default function LandingPage({ onSelectMapa, onSelectControl, currentUser, onLogout, onOpenLogin, onOpenRegister }) {
  const handleSelectMapa = () => {
    if (!currentUser) {
      onOpenLogin();
    } else {
      onSelectMapa();
    }
  };

  const handleSelectControl = () => {
    if (!currentUser) {
      onOpenLogin();
    } else {
      onSelectControl();
    }
  };

  return (
    <div className={styles['landing-container']}>
      {/* Theme Toggle and User Auth in Top Right */}
      <div className={styles['landing-top-actions']}>
        <ThemeToggle />
        {currentUser ? (
          <div className={styles['landing-user-widget']}>
            <span className={styles['user-name']}>
              Hola {currentUser.nombre}
            </span>
            <button
              onClick={onLogout}
              className={styles['btn-logout']}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className={styles['auth-buttons-row']}>
            <button
              onClick={onOpenLogin}
              className={styles['btn-login-premium']}
            >
              Iniciar Sesión
            </button>

            <button
              onClick={onOpenRegister}
              className={styles['btn-register-premium']}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>

      <div className={styles['landing-mesh']}>
        <div className={`${styles['mesh-blob']} ${styles.b1}`}></div>
        <div className={`${styles['mesh-blob']} ${styles.b2}`}></div>
        <div className={`${styles['mesh-blob']} ${styles.b3}`}></div>
      </div>
      <div className={styles['landing-grid']}></div>

      <div className={styles['landing-content']}>

        {/* Logo + Header */}
        <div className={styles['landing-header']}>
          <div className={styles['logo-container']}>
            <img
              src="/web-app-manifest-192x192.png"
              alt="Logo Ministerio de Salud Pública"
              className={styles['landing-logo-img']}
            />
          </div>
          <h1 className={styles['landing-title']}>Sistema de Vigilancia</h1>
          <p className={styles['landing-subtitle']}>Epidemiológica · Santo Domingo-Concordia</p>
          <p className={styles['landing-desc']}>Selecciona el módulo al que deseas acceder</p>
        </div>

        {/* Buttons in Horizontal Row */}
        <div className={styles['landing-buttons']}>

          {/* Mapa de Vectores — azul */}
          <div
            className={`${styles['button-icon']} ${styles['button-icon--blue']}`}
            onClick={handleSelectMapa}
            id="btn-mapa-vectores"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectMapa()}
          >
            <div className={styles.icon}>
              <MapIcon />
            </div>
            <div className={styles.cube}>
              <span className={`${styles.side} ${styles.front}`}>Mapa de Vectores</span>
              <span className={`${styles.side} ${styles.top}`}>Ingresar</span>
            </div>
          </div>

          {/* Control de Vectores — rojo */}
          <div
            className={`${styles['button-icon']} ${styles['button-icon--red']}`}
            onClick={handleSelectControl}
            id="btn-control-vectores"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectControl()}
          >
            <div className={styles.icon}>
              <ShieldIcon />
            </div>
            <div className={styles.cube}>
              <span className={`${styles.side} ${styles.front}`}>Control de Vectores</span>
              <span className={`${styles.side} ${styles.top}`}>Ver módulo</span>
            </div>
          </div>

        </div>

        <p className={styles['landing-footer']}>
          Ministerio de Salud Publica {anioActual}
        </p>
      </div>
    </div>
  );
}
