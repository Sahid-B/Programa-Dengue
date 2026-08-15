import React from 'react';
import { ArrowLeft, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ isReadonly, onShareClick, onBackMenu, currentUser, onLogout }) {
  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src="favicon.svg"
              alt="Logo"
              style={{
                width: '28px',
                height: '28px',
                objectFit: 'contain'
              }}
            />
            Sistema de Vigilancia Epidemiológica
          </h1>
          <p>Ministerio de Salud Pública - Ecuador</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <ThemeToggle />

        {isReadonly && (
          <span style={{
            fontSize: '0.8rem',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--accent-red)',
            fontWeight: '600'
          }}>
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
            <span style={{ marginLeft: '0.5em' }}>Compartir</span>
          </button>
        )}

        {currentUser && (
          <div className="header-user-widget" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.45rem 1rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)'
          }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Hola {currentUser.nombre}
            </span>
            <button
              onClick={onLogout}
              className="btn-logout"
              title="Cerrar sesión"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-red)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: 0,
                transition: 'transform 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
