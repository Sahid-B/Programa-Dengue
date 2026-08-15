import React, { useState } from 'react';
import styles from './EnfermedadModal.module.css';

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
    });
    // Reset form
    setNombre('');
    setCie10('');
    setColor('#3388ff');
    setGravedad('normal');
  };

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Agregar Nueva Enfermedad</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre de la Enfermedad*</label>
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
            <div className={styles['color-picker-row']}>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className={styles['color-input']}
              />
              <div className={styles['color-hint']}>
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
            <button type="button" className="btn-secondary" onClick={onClose}>
              CANCELAR
            </button>
            <button type="submit" className="btn-primary">
              AGREGAR ENFERMEDAD
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
