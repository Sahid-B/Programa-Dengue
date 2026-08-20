import React from 'react';
import { ArrowLeft, LogOut, CloudLightning } from 'lucide-react';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import styles from './Header.module.css';

export default function Header({ isReadonly, onShareClick, onBackMenu, currentUser, onLogout, offlineCount = 0, onSyncClick }) {
  return (
    <header>
      <div className={styles['header-left']}>
        {onBackMenu && (
          <button
            onClick={onBackMenu}
            className="btn-back-menu"
            title="Regresar al menú principal"
            id="btn-back-to-menu"
          >
            <ArrowLeft size={18} />
            <span>Volver al Menú</span>
          </button>
        )}

        <div className="brand">
          <h1 className={styles['brand-title']}>
            <img
              src="favicon.svg"
              alt="Logo"
              className={styles['brand-logo']}
            />
            Sistema de Vigilancia Epidemiológica
          </h1>
          <p>Ministerio de Salud Pública - Ecuador</p>
        </div>
      </div>

      <div className={styles['header-right']}>
        {offlineCount > 0 && (
          <button
            onClick={onSyncClick}
            className={styles['offline-sync-badge']}
            title={`${offlineCount} registros guardados sin internet. Haz clic para intentar sincronizar.`}
          >
            <CloudLightning size={16} className={styles['pulse-animation']} />
            <span>{offlineCount} Pendientes</span>
          </button>
        )}

        <ThemeToggle />

        {isReadonly && (
          <span className={styles['readonly-badge']}>
            Modo Solo Lectura
          </span>
        )}

        {!isReadonly && (
          <button
            onClick={onShareClick}
            className="btn-share-premium"
          >
            <div className="icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" height="20px" width="20px">
                <path d="M800 480H224a32 32 0 1 0 0 64h576a32 32 0 0 0 0-64z" fill="#ffffff" />
                <path d="m786.752 512-265.408 265.344a32 32 0 0 0 45.312 45.312l288-288a32 32 0 0 0 0-45.312l-288-288a32 32 0 1 0-45.312 45.312L786.752 512z" fill="#ffffff" />
              </svg>
            </div>
            <span className={styles['share-text']}>Compartir</span>
          </button>
        )}

        {currentUser && (
          <div className={styles['user-widget']}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hola {currentUser.nombre}
            </span>
            <button
              onClick={onLogout}
              className={`${styles['logout-btn']} btn-logout`}
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
