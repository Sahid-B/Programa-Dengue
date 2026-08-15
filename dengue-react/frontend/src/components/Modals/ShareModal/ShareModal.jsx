import React, { useState, useEffect } from 'react';
import { shareService } from '../../../services/shareService';
import { Link2, Copy, Check } from 'lucide-react';
import styles from './ShareModal.module.css';

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
          if (data && data.ip) {
            // point to local address
            setShareUrl(`http://${data.ip}:5173/readonly`);
          } else {
            setShareUrl('http://localhost:5173/readonly');
          }
        })
        .catch(err => {
          console.error(err);
          setShareUrl('http://localhost:5173/readonly');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen]);

  const handleCopy = () => {
    const input = document.getElementById('share-url-input-react');
    if (input) {
      input.select();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(err => console.error(err));
      } else {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className={`modal ${styles['modal-share']}`} onClick={(e) => e.stopPropagation()}>
        <h2 className={styles['modal-title']}>
          <Link2 size={20} className={styles['link-icon']} />
          Enlace de Solo Lectura
        </h2>
        
        <p className={styles['modal-desc']}>
          Comparte este enlace para que otros puedan ver el dashboard en tu red local sin modificar los datos.
        </p>

        {loading ? (
          <div className={styles['loading-text']}>Generando enlace...</div>
        ) : (
          <div className={styles['input-row']}>
            <input
              type="text"
              id="share-url-input-react"
              readOnly
              value={shareUrl}
              onClick={(e) => e.target.select()}
              className={styles['share-input']}
            />
            <button
              onClick={handleCopy}
              className={`btn-save ${styles['btn-copy']}`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copiado' : 'Copiar'}
            </button>
          </div>
        )}

        <div className={`modal-actions ${styles['actions-center']}`}>
          <button type="button" className="btn-cancel" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
