import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import styles from './MapComponent.module.css';

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

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }
  }, []);

  useEffect(() => {
    if (markersLayerRef.current) {
      markersLayerRef.current.clearLayers();

      pacientes.forEach(p => {
        const lat = parseFloat(p.latitud);
        const lng = parseFloat(p.longitud);

        if (!isNaN(lat) && !isNaN(lng)) {
          // Find color for the disease
          const disease = enfermedades.find(e => e.id == p.enfermedad_id);
          const color = disease ? disease.color_mapa : '#3388ff';

          const isDengue = p.nombre_enfermedad && p.nombre_enfermedad.toLowerCase().includes('dengue');

          const marker = L.marker([lat, lng], {
            icon: L.divIcon({
              className: 'custom-marker',
              html: `<div style="background-color: ${color}; width: 26px; height: 26px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; opacity: 0.9; box-shadow: 0 2px 5px rgba(0,0,0,0.5); box-sizing: border-box;">
                       ${isDengue ? '<span style="font-size: 13px; line-height: 1;">🦟</span>' : '📍'}
                     </div>`,
              iconSize: [30, 30],
              iconAnchor: [15, 15]
            })
          });


          marker.bindPopup(`
            <div class="map-popup-premium">
              <h5>${p.nombre_completo}</h5>
              <p><strong>Enfermedad:</strong> ${p.nombre_enfermedad}</p>
              <p><strong>Unidad:</strong> ${p.unidad_operativa}</p>
              <p><strong>Barrio:</strong> ${p.direccion_barrio}</p>
              <p><strong>Fecha:</strong> ${p.fecha_consulta}</p>
            </div>
          `);

          markersLayerRef.current.addLayer(marker);
        }
      });
    }
  }, [pacientes, enfermedades]);

  // Determine which disease colors to show in the legend
  const activeDiseases = React.useMemo(() => {
    const list = [];
    pacientes.forEach(p => {
      const exists = list.some(item => item.id == p.enfermedad_id);
      if (!exists) {
        const disease = enfermedades.find(e => e.id == p.enfermedad_id);
        if (disease) {
          list.push({
            id: disease.id,
            nombre: disease.nombre,
            color: disease.color_mapa
          });
        }
      }
    });
    return list;
  }, [pacientes, enfermedades]);

  return (
    <div className="map-wrapper">
      <div className="map-badge">
        <span>{badgeText}</span>
      </div>

      <div ref={mapRef} id="main-map" className={styles['map-container']}></div>

      {activeDiseases.length > 0 && (
        <div className="map-legend">
          <h4>Leyenda</h4>
          <div className={styles['legend-list']}>
            {activeDiseases.map((d, i) => (
              <div key={i} className="map-legend-item">
                <span className={styles['legend-dot']} style={{ backgroundColor: d.color }}></span>
                <span>{d.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
