import React, { useState } from 'react';

export default function EnfermedadModal({ isOpen, onClose, onSubmit }) {
  const [nombre, setNombre] = useState('');
  const [cie10, setCie10] = useState('');
  const [color, setColor] = useState('#3388ff');
  const [gravedad, setGravedad] = useState('normal');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      nombre,
      cie_10: cie10,
      color_mapa: color,
      nivel_gravedad: gravedad
    }, () => {
      setNombre('');
      setCie10('');
      setColor('#3388ff');
      setGravedad('normal');
      onClose();
    });
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Nueva Enfermedad</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la enfermedad*</label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Dengue con signos de alarma"
            />
          </div>

          <div className="form-group">
            <label>Código CIE-10</label>
            <input
              type="text"
              value={cie10}
              onChange={(e) => setCie10(e.target.value)}
              placeholder="Ej: A971"
            />
          </div>

          <div className="form-group">
            <label>Color en el mapa</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                style={{ width: '50px', height: '40px', padding: 0, border: 'none', background: 'none', cursor: 'pointer' }}
              />
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Este será el color del marcador en el mapa.
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Nivel de gravedad</label>
            <select
              value={gravedad}
              onChange={(e) => setGravedad(e.target.value)}
              required
            >
              <option value="normal">Normal</option>
              <option value="grave">Grave</option>
            </select>
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
