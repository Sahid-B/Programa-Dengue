import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, Info, HelpCircle, X } from 'lucide-react';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    isOpen: false,
    message: '',
    title: '',
    onConfirm: null,
    onCancel: null,
  });

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showAlert = useCallback((message, type = 'info', title = '') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    let defaultTitle = 'Información';
    if (type === 'success') defaultTitle = '¡Éxito!';
    if (type === 'error') defaultTitle = 'Error';
    if (type === 'warning') defaultTitle = 'Advertencia';

    const newToast = {
      id,
      message,
      type,
      title: title || defaultTitle,
    };

    setToasts((prev) => [...prev, newToast]);

    // Automatically remove after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);

    return Promise.resolve(true); // Return promise to match original API
  }, [removeToast]);

  const showConfirm = useCallback((message, onConfirm, onCancel, title = '¿Confirmar acción?') => {
    setConfirmState({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        if (onConfirm) onConfirm();
      },
      onCancel: () => {
        setConfirmState(prev => ({ ...prev, isOpen: false }));
        if (onCancel) onCancel();
      }
    });
  }, []);

  // Icon mapping for toasts & confirm
  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="toast-icon-svg toast-icon-success" />;
      case 'error':
        return <AlertCircle size={20} className="toast-icon-svg toast-icon-error" />;
      case 'warning':
        return <AlertTriangle size={20} className="toast-icon-svg toast-icon-warning" />;
      case 'confirm':
        return <HelpCircle size={32} className="alert-icon alert-icon-confirm" />;
      case 'info':
      default:
        return <Info size={20} className="toast-icon-svg toast-icon-info" />;
    }
  };

  return (
    <AlertContext.Provider value={{ showAlert, showConfirm }}>
      {children}

      {/* ── Toaster Container (Top Right) ── */}
      <div className="custom-toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`custom-toast toast-type-${toast.type}`}>
            <div className="toast-icon-wrap">
              {getIcon(toast.type)}
            </div>
            <div className="toast-content">
              <h4>{toast.title}</h4>
              <p>{toast.message}</p>
            </div>
            <button className="toast-close-btn" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* ── Centered Confirm Modal ── */}
      {confirmState.isOpen && (
        <div className="custom-alert-overlay">
          <div className="custom-alert-card alert-type-confirm">
            <div className="custom-alert-header">
              <h3>{confirmState.title}</h3>
            </div>
            <div className="custom-alert-body">
              <p>{confirmState.message}</p>
            </div>
            <div className="custom-alert-actions">
              <button onClick={confirmState.onCancel} className="btn-alert-cancel">
                Cancelar
              </button>
              <button onClick={confirmState.onConfirm} className="btn-alert-confirm">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert debe usarse dentro de un AlertProvider');
  }
  return context;
}
