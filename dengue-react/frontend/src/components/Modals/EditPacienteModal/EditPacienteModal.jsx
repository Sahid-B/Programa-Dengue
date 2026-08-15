import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { useAlert } from '../../../context/AlertContext';
import styles from './EditPacienteModal.module.css';

export default function EditPacienteModal({ isOpen, onClose, paciente, distritos, enfermedades, onSubmit }) {
  const { showAlert } = useAlert();
  const today = new Date().toISOString().split('T')[0];

  // States
  const [fechaConsulta, setFechaConsulta] = useState('');
  const [distrito, setDistrito] = useState('');
  const [unidadId, setUnidadId] = useState('');
  const [enfermedadId, setEnfermedadId] = useState('');
  const [cie10, setCie10] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [edad, setEdad] = useState('');
  const [sexo, setSexo] = useState('Masculino');
  const [barrio, setBarrio] = useState('');
  const [latitud, setLatitud] = useState('');
  const [longitud, setLongitud] = useState('');
  const [observaciones, setObservaciones] = useState('');

  // Unidades filtering
  const [unidades, setUnidades] = useState([]);

  // Refs for map
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Sync state with selected paciente
  useEffect(() => {
    if (paciente) {
      setFechaConsulta(paciente.fecha_consulta || today);
      setDistrito(paciente.distrito_operativo || '');
      setEnfermedadId(paciente.enfermedad_id || '');
      setCie10(paciente.cie_10 || '');
      setNombreCompleto(paciente.nombre_completo || '');
      setCedula(paciente.cedula || '');
      setTelefono(paciente.telefono || '');
      setEdad(paciente.edad || '');
      setSexo(paciente.sexo || 'Masculino');
      setBarrio(paciente.direccion_barrio || '');
      setLatitud(paciente.latitud || '');
      setLongitud(paciente.longitud || '');
      setObservaciones(paciente.observaciones || '');

      // Locate correct unit ID by matching name
      // This is a simple fallback since the list of units comes asynchronously
      if (paciente.distrito_operativo) {
        const districtObj = distritos.find(d => d.distrito === paciente.distrito_operativo);
        if (districtObj && districtObj.unidades) {
          setUnidades(districtObj.unidades);
          const foundUnit = districtObj.unidades.find(u => u.nombre === paciente.unidad_operativa);
          if (foundUnit) {
            setUnidadId(foundUnit.id);
          }
        }
      }
    }
  }, [paciente, distritos]);

  // Load units when district changes
  useEffect(() => {
    if (distrito) {
      const selected = distritos.find(d => d.distrito === distrito);
      if (selected) {
        setUnidades(selected.unidades || []);
      } else {
        setUnidades([]);
      }
    } else {
      setUnidades([]);
    }
  }, [distrito, distritos]);

  // Sync CIE-10 code when disease changes
  useEffect(() => {
    if (enfermedadId) {
      const selected = enfermedades.find(e => e.id == enfermedadId);
      if (selected) {
        setCie10(selected.cie_10 || '');
      } else {
        setCie10('');
      }
    } else {
      setCie10('');
    }
  }, [enfermedadId, enfermedades]);

  // Initialize and update Map
  useEffect(() => {
    if (isOpen && mapRef.current) {
      // Small timeout to allow Modal transitions to finish and container to layout
      const timer = setTimeout(() => {
        const initialLat = parseFloat(latitud) || 0.0151;
        const initialLng = parseFloat(longitud) || -79.3925;

        if (!mapInstanceRef.current) {
          const map = L.map(mapRef.current).setView([initialLat, initialLng], 14);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(map);

          mapInstanceRef.current = map;

          // Drag/Click trigger to position marker
          map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            updateMarkerPosition(lat, lng);
          });
        } else {
          mapInstanceRef.current.setView([initialLat, initialLng], 14);
          // Force Leaflet to recalculate container bounds
          mapInstanceRef.current.invalidateSize();
        }

        // Put initial marker if coordinate exists
        if (parseFloat(latitud) && parseFloat(longitud)) {
          if (markerRef.current) {
            markerRef.current.setLatLng([initialLat, initialLng]);
          } else {
            markerRef.current = L.marker([initialLat, initialLng], { draggable: true })
              .addTo(mapInstanceRef.current);

            markerRef.current.on('dragend', () => {
              const position = markerRef.current.getLatLng();
              setLatitud(position.lat.toFixed(8));
              setLongitud(position.lng.toFixed(8));
            });
          }
        } else {
          if (markerRef.current) {
            mapInstanceRef.current.removeLayer(markerRef.current);
            markerRef.current = null;
          }
        }
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [isOpen, latitud, longitud]);

  const updateMarkerPosition = (lat, lng) => {
    setLatitud(lat.toFixed(8));
    setLongitud(lng.toFixed(8));

    if (mapInstanceRef.current) {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true })
          .addTo(mapInstanceRef.current);

        markerRef.current.on('dragend', () => {
          const position = markerRef.current.getLatLng();
          setLatitud(position.lat.toFixed(8));
          setLongitud(position.lng.toFixed(8));
        });
      }
    }
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      showAlert('La geolocalización no es compatible con este navegador.', 'error');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateMarkerPosition(latitude, longitude);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
        showAlert('Ubicación obtenida con éxito.', 'success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        showAlert('No se pudo obtener la ubicación actual. Permiso denegado.', 'error');
      }
    );
  };

  const handleLatLonChange = (latVal, lonVal) => {
    setLatitud(latVal);
    setLongitud(lonVal);

    const lat = parseFloat(latVal);
    const lng = parseFloat(lonVal);

    if (!isNaN(lat) && !isNaN(lng) && mapInstanceRef.current) {
      updateMarkerPosition(lat, lng);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!unidadId || !enfermedadId || !nombreCompleto || !edad || !sexo || !barrio || !latitud || !longitud) {
      showAlert('Por favor, complete todos los campos obligatorios.', 'warning');
      return;
    }

    const payload = {
      id: paciente.id,
      fecha_consulta: fechaConsulta,
      enfermedad_id: enfermedadId,
      unidad_id: unidadId,
      nombre_completo: nombreCompleto,
      cedula,
      telefono,
      edad,
      sexo,
      direccion_barrio: barrio,
      latitud,
      longitud,
      observaciones
    };

    onSubmit(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div
        className={`modal ${styles['modal-custom-size']}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>Editar Paciente</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Fecha de Consulta*</label>
            <input
              type="date"
              max={today}
              value={fechaConsulta}
              onChange={(e) => setFechaConsulta(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Distrito Operativo*</label>
            <select
              value={distrito}
              onChange={(e) => {
                setDistrito(e.target.value);
                setUnidadId('');
              }}
              required
            >
              <option value="">Seleccione Distrito...</option>
              {distritos.map((d, i) => (
                <option key={i} value={d.distrito}>{d.distrito}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Unidad Operativa*</label>
            <select
              value={unidadId}
              onChange={(e) => setUnidadId(e.target.value)}
              disabled={!distrito}
              required
            >
              <option value="">Seleccione Unidad...</option>
              {unidades.map(u => (
                <option key={u.id} value={u.id}>{u.nombre}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Enfermedad*</label>
            <select
              value={enfermedadId}
              onChange={(e) => setEnfermedadId(e.target.value)}
              required
            >
              <option value="">Seleccione Enfermedad...</option>
              {enfermedades.map(e => (
                <option key={e.id} value={e.id}>
                  {e.cie_10 || 'N/A'} - {e.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Diagnóstico CIE-10</label>
            <input
              type="text"
              value={cie10}
              readOnly
              className={styles['input-readonly']}
            />
          </div>

          <div className="form-group">
            <label>Apellidos y Nombres*</label>
            <input
              type="text"
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Cédula de Identidad</label>
            <input
              type="text"
              value={cedula}
              onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
            />
          </div>

          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="tel"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
              maxLength={10}
            />
          </div>

          <div className={`form-group ${styles['flex-row']}`}>
            <div className={styles['flex-col-1']}>
              <label>Edad*</label>
              <input
                type="number"
                min="0"
                max="120"
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                required
              />
            </div>
            <div className={styles['flex-col-1']}>
              <label>Sexo*</label>
              <select
                value={sexo}
                onChange={(e) => setSexo(e.target.value)}
                required
              >
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Dirección / Barrio*</label>
            <input
              type="text"
              value={barrio}
              onChange={(e) => setBarrio(e.target.value)}
              required
              list="barrios-list-edit"
            />
            <datalist id="barrios-list-edit">
              <option value="San Pablo" />
              <option value="Santa Rosa" />
              <option value="5 de Agosto" />
              <option value="Urdesa" />
              <option value="San Rafael" />
              <option value="10 de Agosto" />
              <option value="San Carlos" />
              <option value="Las Delicias" />
              <option value="La Unión" />
              <option value="El Esfuerzo" />
              <option value="Nuevo Israel" />
              <option value="Monterrey" />
              <option value="Los Pinos" />
              <option value="Villanueva" />
              <option value="La Independencia" />
            </datalist>
          </div>

          <div className="form-group">
            <label>Ubicación Geográfica*</label>
            <button
              type="button"
              onClick={handleGetCurrentLocation}
              className={`btn-location ${styles['btn-location-content']}`}
            >
              <Navigation size={14} />
              Usar mi ubicación actual
            </button>
            <div className="coord-inputs">
              <input
                type="number"
                step="0.00000001"
                placeholder="Latitud"
                value={latitud}
                onChange={(e) => handleLatLonChange(e.target.value, longitud)}
                required
              />
              <input
                type="number"
                step="0.00000001"
                placeholder="Longitud"
                value={longitud}
                onChange={(e) => handleLatLonChange(latitud, e.target.value)}
                required
              />
            </div>
            <div ref={mapRef} id="mini-map-edit" className={styles['mini-map-container']}></div>
          </div>

          <div className="form-group">
            <label>Observaciones</label>
            <textarea
              rows="3"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ingrese observaciones sobre el paciente..."
            ></textarea>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              CANCELAR
            </button>
            <button type="submit" className="btn-primary">
              GUARDAR CAMBIOS
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
