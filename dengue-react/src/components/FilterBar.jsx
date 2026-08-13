import React from 'react';
import { CalendarRange, RotateCcw, Filter, MapPin } from 'lucide-react';

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
      {/* Date Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.25rem' }}>
        <CalendarRange size={16} style={{ color: 'var(--primary)' }} />
        <span className="filter-label">Filtro de Fechas:</span>
      </div>

      <input
        type="date"
        value={filters.fecha_inicio || ''}
        onChange={handleStartChange}
        placeholder="Fecha inicio"
      />
      <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>a</span>
      <input
        type="date"
        value={filters.fecha_fin || ''}
        onChange={handleEndChange}
        placeholder="Fecha fin"
      />

      {/* District Filter Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '1rem', marginRight: '0.25rem' }}>
        <MapPin size={16} style={{ color: 'var(--accent-orange)' }} />
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

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
        <button onClick={onApply} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <Filter size={14} />
          Filtrar
        </button>
        
        <button onClick={onClear} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <RotateCcw size={14} />
          Limpiar
        </button>
      </div>
    </div>
  );
}
