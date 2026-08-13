import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function MapComponent({ pacientes, enfermedades = [], badgeText }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current && mapRef.current) {
      // Initialize map
      const map = L.map(mapRef.current).setView([0.0151, -79.3925], 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      const markersLayer = new L.LayerGroup().addTo(map);
      
      mapInstanceRef.current = map;
      markersLayerRef.current = markersLayer;
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markersLayerRef.current = null;
      }
    };
  }, []);

  // Update markers when patients data changes
  useEffect(() => {
    if (markersLayerRef.current && mapInstanceRef.current) {
      markersLayerRef.current.clearLayers();

      pacientes.forEach(p => {
        const isDengue = p.nombre_enfermedad.toLowerCase().includes('dengue');
        const lat = parseFloat(p.latitud);
        const lng = parseFloat(p.longitud);

        if (!isNaN(lat) && !isNaN(lng)) {
          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${p.color_mapa || '#3388ff'}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; opacity: 0.9; box-shadow: 0 2px 5px rgba(0,0,0,0.5); box-sizing: border-box;">
                       ${isDengue ? '<span style="font-size: 13px; line-height: 1;">🦟</span>' : '📍'}
                     </div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          });

          const popupContent = `
            <div style="font-family: var(--font-body); color: var(--text-primary);">
              <strong style="font-family: var(--font-title); font-size: 1rem; color: var(--primary); display: block; margin-bottom: 0.25rem;">
                ${escapeHtml(p.nombre_completo)}
              </strong>
              <div style="display: grid; grid-template-columns: auto 1fr; gap: 0.25rem 0.5rem; font-size: 0.8rem; line-height: 1.4;">
                <span style="color: var(--text-secondary);">Edad/Sexo:</span>
                <span>${escapeHtml(p.edad.toString())} años | ${escapeHtml(p.sexo)}</span>
                
                <span style="color: var(--text-secondary);">Enfermedad:</span>
                <span>
                  <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:${p.color_mapa}; margin-right:4px;"></span>
                  ${escapeHtml(p.nombre_enfermedad)} (${escapeHtml(p.cie_10 || 'N/A')})
                </span>
                
                <span style="color: var(--text-secondary);">Barrio:</span>
                <span>${escapeHtml(p.direccion_barrio)}</span>
                
                <span style="color: var(--text-secondary);">Fecha:</span>
                <span>${escapeHtml(p.fecha_consulta)}</span>
                
                <span style="color: var(--text-secondary);">Unidad:</span>
                <span>${escapeHtml(p.unidad_operativa || 'No asignada')}</span>
                
                <span style="color: var(--text-secondary);">Observaciones:</span>
                <span>${escapeHtml(p.observaciones || 'Ninguna')}</span>
              </div>
            </div>
          `;

          marker.bindPopup(popupContent);
          markersLayerRef.current.addLayer(marker);
        }
      });

      // Recalcular el tamaño del mapa en caso de redibujo
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 100);
    }
  }, [pacientes]);

  const escapeHtml = (str) => {
    if (!str) return '';
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Get active unique diseases for the legend, falling back to all catalog diseases so it remains visible permanently
  const activeDiseases = React.useMemo(() => {
    // If we have full catalog diseases loaded, use them!
    if (enfermedades && enfermedades.length > 0) {
      return enfermedades.map(e => ({
        nombre: e.nombre,
        color: e.color_mapa || '#3388ff'
      }));
    }
    
    // Otherwise fallback to unique active diseases from patients
    const list = [];
    const seen = new Set();
    pacientes.forEach(p => {
      const key = p.nombre_enfermedad;
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push({
          nombre: p.nombre_enfermedad,
          color: p.color_mapa || '#3388ff'
        });
      }
    });
    
    // If still empty (e.g. initial load or empty filter), fallback to default vigilated diseases
    if (list.length === 0) {
      return [
        { nombre: 'Dengue grave', color: '#9b2226' },
        { nombre: 'Dengue con signos de alarma', color: '#e53e3e' },
        { nombre: 'Dengue sin signos de alarma', color: '#ed8936' },
        { nombre: 'Zika', color: '#38a169' },
        { nombre: 'Chikungunya', color: '#d69e2e' },
        { nombre: 'Malaria', color: '#805ad5' }
      ];
    }
    return list;
  }, [pacientes, enfermedades]);

  return (
    <div className="map-wrapper">
      <div className="map-badge">
        <span>{badgeText}</span>
      </div>

      <div ref={mapRef} id="main-map" style={{ width: '100%', height: '100%' }}></div>

      {activeDiseases.length > 0 && (
        <div className="map-legend">
          <h4>Leyenda</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {activeDiseases.map((d, i) => (
              <div key={i} className="map-legend-item">
                <span style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  backgroundColor: d.color,
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}></span>
                <span>{d.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
