import React from 'react';
import './LandingPage.css';
import ThemeToggle from '../components/ThemeToggle';
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
    <div className="landing-container">
      {/* Theme Toggle and User Auth in Top Right */}
      <div className="landing-top-actions" style={{
        position: 'absolute',
        top: '2rem',
        right: '2.5rem',
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <ThemeToggle />
        {currentUser ? (
          <div className="landing-user-widget" style={{
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
        ) : (
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              onClick={onOpenLogin}
              className="btn-login-premium"
              style={{
                padding: '0.55rem 1.25rem',
                background: 'var(--primary)',
                border: 'none',
                borderRadius: '12px',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: 'var(--font-title)',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(14, 165, 233, 0.15)',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(14, 165, 233, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.15)';
              }}
            >
              Iniciar Sesión
            </button>

            <button
              onClick={onOpenRegister}
              className="btn-register-premium"
              style={{
                padding: '0.55rem 1.25rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 700,
                fontFamily: 'var(--font-title)',
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              Registrarse
            </button>
          </div>
        )}
      </div>

      <div className="landing-mesh">
        <div className="mesh-blob b1"></div>
        <div className="mesh-blob b2"></div>
        <div className="mesh-blob b3"></div>
      </div>
      <div className="landing-grid"></div>

      <div className="landing-content">

        {/* Logo + Header */}
        <div className="landing-header">
          <div className="logo-container">
            <img
              src="/web-app-manifest-192x192.png"
              alt="Logo Ministerio de Salud Pública"
              className="landing-logo-img"
            />
          </div>
          <h1 className="landing-title">Sistema de Vigilancia</h1>
          <p className="landing-subtitle">Epidemiológica · Santo Domingo-Concordia</p>
          <p className="landing-desc">Selecciona el módulo al que deseas acceder</p>
        </div>

        {/* Buttons in Horizontal Row */}
        <div className="landing-buttons">

          {/* Mapa de Vectores — azul */}
          <div
            className="button-icon button-icon--blue"
            onClick={handleSelectMapa}
            id="btn-mapa-vectores"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectMapa()}
          >
            <div className="icon">
              <MapIcon />
            </div>
            <div className="cube">
              <span className="side front">Mapa de Vectores</span>
              <span className="side top">Ingresar</span>
            </div>
          </div>

          {/* Control de Vectores — rojo */}
          <div
            className="button-icon button-icon--red"
            onClick={handleSelectControl}
            id="btn-control-vectores"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelectControl()}
          >
            <div className="icon">
              <ShieldIcon />
            </div>
            <div className="cube">
              <span className="side front">Control de Vectores</span>
              <span className="side top">Ver módulo</span>
            </div>
          </div>

        </div>

        <p className="landing-footer">
          Ministerio de Salud Publica {anioActual}
        </p>
      </div>
    </div>
  );
}
