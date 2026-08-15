import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';

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

  // Map Refs
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Unidades based on selected Distrito
  const activeDistritoObj = distritos.find(d => d.distrito === distrito);
  const unidades = activeDistritoObj ? activeDistritoObj.unidades : [];

  // Initialize fields when patient changes
  useEffect(() => {
    if (paciente) {
      setFechaConsulta(paciente.fecha_consulta || '');
      setNombreCompleto(paciente.nombre_completo || '');
      setCedula(paciente.cedula || '');
      setTelefono(paciente.telefono || '');
      setEdad(paciente.edad || '');
      setSexo(paciente.sexo || 'Masculino');
      setEnfermedadId(paciente.enfermedad_id ? paciente.enfermedad_id.toString() : '');
      setBarrio(paciente.direccion_barrio || '');
      setLatitud(paciente.latitud || '');
      setLongitud(paciente.longitud || '');
      setObservaciones(paciente.observaciones || '');
      
      // Select the correct distrito from data based on matching unit name
      if (paciente.distrito_operativo) {
        setDistrito(paciente.distrito_operativo);
      } else {
        const foundDist = distritos.find(d => 
          d.unidades.some(u => u.nombre === paciente.unidad_operativa)
        );
        setDistrito(foundDist ? foundDist.distrito : '');
      }
    }
  }, [paciente, distritos]);

  // Set unit ID after options are updated
  useEffect(() => {
    if (paciente && distrito) {
      const foundDist = distritos.find(d => d.distrito === distrito);
      if (foundDist) {
        const foundUnit = foundDist.unidades.find(u => u.nombre === paciente.unidad_operativa);
        if (foundUnit) {
          setUnidadId(foundUnit.id.toString());
        }
      }
    }
  }, [distrito, paciente, distritos]);

  // Update CIE-10 when disease changes
  useEffect(() => {
    const selectedEnf = enfermedades.find(e => e.id.toString() === enfermedadId);
    setCie10(selectedEnf ? (selectedEnf.cie_10 || '') : '');
  }, [enfermedadId, enfermedades]);

  // Initialize map when modal opens
  useEffect(() => {
    let map = null;
    
    if (isOpen && mapRef.current && !mapInstanceRef.current) {
      const initialLat = parseFloat(latitud) || 0.0151;
      const initialLng = parseFloat(longitud) || -79.3925;
      
      map = L.map(mapRef.current).setView([initialLat, initialLng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
      }).addTo(map);

      map.on('click', (e) => {
        const latVal = e.latlng.lat.toFixed(8);
        const lngVal = e.latlng.lng.toFixed(8);
        setLatitud(latVal);
        setLongitud(lngVal);
        updateMarker(latVal, lngVal, map);
      });

      mapInstanceRef.current = map;

      if (latitud && longitud) {
        updateMarker(latitud, longitud, map);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, [isOpen, latitud, longitud]);

  const updateMarker = (latVal, lngVal, mapInstance = mapInstanceRef.current) => {
    if (!mapInstance) return;
    const l = parseFloat(latVal);
    const g = parseFloat(lngVal);
    if (isNaN(l) || isNaN(g)) return;

    if (markerRef.current) {
      mapInstance.removeLayer(markerRef.current);
    }
    markerRef.current = L.marker([l, g]).addTo(mapInstance);
    mapInstance.setView([l, g], 15);
  };

  const handleLatLonChange = (latVal, lngVal) => {
    setLatitud(latVal);
    setLongitud(lngVal);
    if (latVal && lngVal) {
      updateMarker(latVal, lngVal);
    }
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latVal = position.coords.latitude.toFixed(8);
          const lngVal = position.coords.longitude.toFixed(8);
          setLatitud(latVal);
          setLongitud(lngVal);
          updateMarker(latVal, lngVal);
        },
        (err) => showAlert('No se pudo obtener la ubicación: ' + err.message, 'error')
      );
    } else {
      showAlert('Geolocalización no soportada por el navegador.', 'warning');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (cedula && !/^\d{10}$/.test(cedula)) {
      showAlert('La cédula debe tener exactamente 10 dígitos numéricos.', 'warning');
      return;
    }

    if (telefono && !/^\d{10}$/.test(telefono)) {
      showAlert('El teléfono debe tener exactamente 10 dígitos numéricos.', 'warning');
      return;
    }

    const payload = {
      fecha_consulta: fechaConsulta,
      unidad_operativa_id: parseInt(unidadId),
      enfermedad_id: parseInt(enfermedadId),
      nombre_completo: nombreCompleto,
      cedula,
      telefono,
      edad: parseInt(edad),
      sexo,
      direccion_barrio: barrio,
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
      observaciones
    };

    onSubmit(paciente.id, payload, onClose);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isOpen ? 'active' : ''}`} onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '80%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto' }}
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
              style={{ opacity: 0.7 }}
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

          <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
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
            <div style={{ flex: 1 }}>
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
              className="btn-location"
              onClick={handleGetCurrentLocation}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
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
            <div ref={mapRef} id="mini-map-edit" style={{ width: '100%', height: '200px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', zIndex: 1 }}></div>
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
            <button type="button" className="btn-cancel" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
