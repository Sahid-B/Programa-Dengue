import React, { useState } from 'react';

export default function UnidadModal({ isOpen, onClose, onSubmit }) {
  const [distrito, setDistrito] = useState('');
  const [unidad, setUnidad] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ distrito, nombre: unidad }, () => {
      setDistrito('');
      setUnidad('');
      onClose();
    });
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Nueva Unidad Operativa</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Distrito</label>
            <input
              type="text"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              required
              placeholder="Ej: La Concordia"
            />
          </div>
          
          <div className="form-group">
            <label>Nombre de la Unidad</label>
            <input
              type="text"
              value={unidad}
              onChange={(e) => setUnidad(e.target.value)}
              required
              placeholder="Ej: Centro de Salud La Concordia"
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
