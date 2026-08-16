import React from 'react';
import { CalendarRange, RotateCcw, Filter, MapPin } from 'lucide-react';
import styles from './FilterBar.module.css';

export default function FilterBar({ filters, setFilters, onApply, onClear }) {
  const handleStartChange = (e) => {
    setFilters(prev => ({ ...prev, fecha_inicio: e.target.value }));
  };

  const handleEndChange = (e) => {
    setFilters(prev => ({ ...prev, fecha_fin: e.target.value }));
  };

  const handleDistritoChange = (e) => {
    setFilters(prev => ({ ...prev, distrito: e.target.value }));
  };

  return (
    <div className="filter-bar">
      {/* Date Filter Group */}
      <div className={styles['filter-group']}>
        <div className={styles['date-filter-label']}>
          <CalendarRange size={16} className={styles['calendar-icon']} />
          <span className="filter-label">Filtro de Fechas:</span>
        </div>
        <div className={styles['date-inputs']}>
          <input
            type="date"
            value={filters.fecha_inicio || ''}
            onChange={handleStartChange}
            placeholder="Fecha inicio"
          />
          <span className={styles.separator}>a</span>
          <input
            type="date"
            value={filters.fecha_fin || ''}
            onChange={handleEndChange}
            placeholder="Fecha fin"
          />
        </div>
      </div>

      {/* District Filter Group */}
      <div className={styles['filter-group']}>
        <div className={styles['district-filter-label']}>
          <MapPin size={16} className={styles['map-pin-icon']} />
          <span className="filter-label">Distrito:</span>
        </div>
        <select
          value={filters.distrito || 'Todos'}
          onChange={handleDistritoChange}
          className="filter-select"
        >
          <option value="Todos">Todos</option>
          <option value="La Concordia">La Concordia</option>
          <option value="Santo Domingo">Santo Domingo</option>
        </select>
      </div>

      {/* Buttons */}
      <div className={styles['buttons-container']}>
        <button onClick={onApply} className={`btn-primary ${styles['btn-with-icon']}`}>
          <Filter size={14} />
          Filtrar
        </button>
        
        <button onClick={onClear} className={`btn-secondary ${styles['btn-with-icon']}`}>
          <RotateCcw size={14} />
          Limpiar
        </button>
      </div>
    </div>
  );
}
