import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import styles from './PatientForm.module.css';

export default function PatientForm({ distritos, enfermedades, onSubmit, onAddUnidad, onAddEnfermedad, onAddDistrito }) {
  const { showAlert } = useAlert();
  const today = new Date().toISOString().split('T')[0];

  // Form State
  const [fechaConsulta, setFechaConsulta] = useState(today);
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
  const miniMapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  // Load Unidades based on selected Distrito
  const activeDistritoObj = distritos.find(d => d.distrito === distrito);
  const unidades = activeDistritoObj ? activeDistritoObj.unidades : [];

  // Update CIE-10 when enfermedad changes
  useEffect(() => {
    const selectedEnf = enfermedades.find(e => e.id.toString() === enfermedadId);
    setCie10(selectedEnf ? (selectedEnf.cie_10 || '') : '');
  }, [enfermedadId, enfermedades]);

  // Map Initialization
  useEffect(() => {
    if (!mapInstanceRef.current && miniMapRef.current) {
      const map = L.map(miniMapRef.current).setView([0.0151, -79.3925], 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      map.on('click', (e) => {
        const lat = e.latlng.lat.toFixed(8);
        const lng = e.latlng.lng.toFixed(8);
        setLatitud(lat);
        setLongitud(lng);
        updateMarker(lat, lng, map);
      });

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []);

  const updateMarker = (lat, lng, mapInstance = mapInstanceRef.current) => {
    if (!mapInstance) return;
    const l = parseFloat(lat);
    const g = parseFloat(lng);
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
          const lat = position.coords.latitude.toFixed(8);
          const lng = position.coords.longitude.toFixed(8);
          setLatitud(lat);
          setLongitud(lng);
          updateMarker(lat, lng);
        },
        (err) => showAlert('No se pudo obtener la ubicación: ' + err.message, 'error')
      );
    } else {
      showAlert('Geolocalización no soportada por el navegador.', 'warning');
    }
  };

  const handleFormSubmit = (e) => {
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
      nombre_completo: nombreCompleto,
      cedula,
      telefono,
      direccion_barrio: barrio,
      edad: parseInt(edad),
      sexo,
      enfermedad_id: parseInt(enfermedadId),
      unidad_operativa_id: parseInt(unidadId),
      fecha_consulta: fechaConsulta,
      latitud: parseFloat(latitud),
      longitud: parseFloat(longitud),
      observaciones
    };

    onSubmit(payload, resetForm);
  };

  const resetForm = () => {
    setFechaConsulta(today);
    setDistrito('');
    setUnidadId('');
    setEnfermedadId('');
    setCie10('');
    setNombreCompleto('');
    setCedula('');
    setTelefono('');
    setEdad('');
    setSexo('Masculino');
    setBarrio('');
    setLatitud('');
    setLongitud('');
    setObservaciones('');
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
      mapInstanceRef.current.setView([0.0151, -79.3925], 13);
    }
  };

  return (
    <div className="form-container">
      <h2>Registrar Nuevo Paciente</h2>
      
      <form onSubmit={handleFormSubmit}>
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
          <div className="input-with-btn">
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
            <button
              type="button"
              className="btn-add"
              onClick={onAddDistrito}
              title="Agregar Distrito"
            >
              ＋
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Unidad Operativa*</label>
          <div className="input-with-btn">
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
            <button
              type="button"
              className="btn-add"
              onClick={onAddUnidad}
              title="Agregar Unidad"
            >
              ＋
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Enfermedad*</label>
          <div className="input-with-btn">
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
            <button
              type="button"
              className="btn-add"
              onClick={onAddEnfermedad}
              title="Agregar Enfermedad"
            >
              ＋
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Diagnóstico CIE-10</label>
          <input
            type="text"
            value={cie10}
            readOnly
            placeholder="Se autocompleta al seleccionar enfermedad"
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
            placeholder="Ej: Pérez García Juan Carlos"
          />
        </div>

        <div className="form-group">
          <label>Cédula de Identidad</label>
          <input
            type="text"
            value={cedula}
            onChange={(e) => setCedula(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
            placeholder="Ej: 1721234560"
          />
        </div>

        <div className="form-group">
          <label>Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
            maxLength={10}
            placeholder="Ej: 0991436654"
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
            list="barrios-list"
            placeholder="Escriba o seleccione un barrio..."
          />
          <datalist id="barrios-list">
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

          <div ref={miniMapRef} id="mini-map" className={styles['mini-map-container']}></div>
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

        <button type="submit" className="btn-submit">
          REGISTRAR PACIENTE
        </button>
      </form>
    </div>
  );
}
