import React, { useState } from 'react';

export default function DistritoModal({ isOpen, onClose, onSubmit }) {
  const [distrito, setDistrito] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ distrito_operativo: distrito, unidad_operativa: 'Centro de Salud Principal' }, () => {
      setDistrito('');
      onClose();
    });
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Nuevo Distrito Operativo</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre del Distrito</label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              required
              placeholder="Ej: Distrito 23D01"
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
