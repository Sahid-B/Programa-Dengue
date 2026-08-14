import React from 'react';
import './LandingPage.css';
import ThemeToggle from '../components/ThemeToggle';

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

export default function LandingPage({ onSelectMapa, onSelectControl }) {
  return (
    <div className="landing-container">
      {/* Theme Toggle in Top Right */}
      <div className="landing-theme-toggle">
        <ThemeToggle />
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
            onClick={onSelectMapa}
            id="btn-mapa-vectores"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectMapa()}
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
            onClick={onSelectControl}
            id="btn-control-vectores"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onSelectControl()}
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
