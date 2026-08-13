import React, { useState, useEffect } from 'react';
import { shareService } from '../../services/shareService';
import { Link2, Copy, Check } from 'lucide-react';

export default function ShareModal({ isOpen, onClose }) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setCopied(false);
      shareService.getServerIp()
        .then(data => {
          const ip = data.ip;
          const port = window.location.port ? ':' + window.location.port : '';
          const path = window.location.pathname;
          
          // Force HTTP since local IPs rarely have SSL configured
          const url = `http://${ip}${port}${path}?readonly=1`;
          setShareUrl(url);
        })
        .catch(err => {
          console.error('Error generating share link:', err);
          // Fallback if IP cannot be retrieved
          setShareUrl(`${window.location.protocol}//${window.location.host}${window.location.pathname}?readonly=1`);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback manual select
      const input = document.getElementById('share-url-input-react');
      if (input) {
        input.select();
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          <Link2 size={20} style={{ color: 'var(--primary)' }} />
          Enlace de Solo Lectura
        </h2>
        
        <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Comparte este enlace para que otros puedan ver el dashboard en tu red local sin modificar los datos.
        </p>

        {loading ? (
          <div style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Generando enlace...</div>
        ) : (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              id="share-url-input-react"
              readOnly
              value={shareUrl}
              onClick={(e) => e.target.select()}
              style={{
                flex: 1,
                padding: '0.6rem 0.8rem',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                color: 'var(--primary)',
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}
            />
            <button
              onClick={handleCopy}
              className="btn-save"
              style={{
                width: 'auto',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0 1rem'
              }}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        )}

        <div className="modal-actions" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
