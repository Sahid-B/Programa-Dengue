import React from 'react';
import { Activity } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ isReadonly, onShareClick }) {
  return (
    <header>
      <div className="brand">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img
            src="favicon.svg"
            alt="Logo"
            style={{
              width: '28px',
              height: '28px',
              objectFit: 'contain',
              filter: 'drop-shadow(var(--shadow-neon-primary))'
            }}
          />
          Sistema de Vigilancia Epidemiológica
        </h1>
        <p>Ministerio de Salud Pública - Ecuador</p>
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
            Compartir Vista
            <div className="icon">
              <svg height={24} width={24} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h24v24H0z" fill="none" />
                <path d="M16.172 11l-5.364-5.364 1.414-1.414L20 12l-7.778 7.778-1.414-1.414L16.172 13H4v-2z" fill="currentColor" />
              </svg>
            </div>
          </button>
        )}
      </div>
    </header>
  );
}
