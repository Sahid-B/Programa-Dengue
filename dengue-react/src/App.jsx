import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import FilterBar from './components/FilterBar';

// Pages
import AnalyticsDashboardPage from './pages/AnalyticsDashboardPage';
import DashboardPage from './pages/DashboardPage';
import TablePage from './pages/TablePage';
import RegisterPage from './pages/RegisterPage';
import LandingPage from './pages/LandingPage';
import UnderConstructionPage from './pages/UnderConstructionPage';

// Modals
import UnidadModal from './components/Modals/UnidadModal';
import EnfermedadModal from './components/Modals/EnfermedadModal';
import EditPacienteModal from './components/Modals/EditPacienteModal';
import ShareModal from './components/Modals/ShareModal';

// Services
import { pacientesService } from './services/pacientesService';
import { enfermedadesService } from './services/enfermedadesService';
import { unidadesService } from './services/unidadesService';

// ─── Route Helpers ────────────────────────────────────────────────────────────
const getRouteFromPath = (path) => {
  const cleanPath = path.toLowerCase().replace(/\/$/, '') || '/';
  switch (cleanPath) {
    case '/control':
      return { appView: 'control', activeTab: 'dashboard' };
    case '/dashboard':
      return { appView: 'mapa', activeTab: 'dashboard' };
    case '/mapa':
      return { appView: 'mapa', activeTab: 'map' };
    case '/tabla':
      return { appView: 'mapa', activeTab: 'table' };
    case '/registro':
      return { appView: 'mapa', activeTab: 'form' };
    default:
      return { appView: 'landing', activeTab: 'dashboard' };
  }
};

const getPathFromRoute = (appView, activeTab) => {
  if (appView === 'landing') return '/';
  if (appView === 'control') return '/control';
  if (appView === 'mapa') {
    switch (activeTab) {
      case 'map': return '/mapa';
      case 'table': return '/tabla';
      case 'form': return '/registro';
      case 'dashboard': default: return '/dashboard';
    }
  }
  return '/';
};

export default function App() {
  // Readonly Mode
  const urlParams = new URLSearchParams(window.location.search);
  const isReadonly = urlParams.get('readonly') === '1';

  // Navigation state initialized from URL
  const initialRoute = getRouteFromPath(window.location.pathname);
  const [appView, setAppView] = useState(initialRoute.appView);
  const [activeTab, setActiveTab] = useState(initialRoute.activeTab);

  // Sync state & URL
  const navigateTo = (newAppView, newActiveTab = 'dashboard') => {
    setAppView(newAppView);
    setActiveTab(newActiveTab);
    const targetPath = getPathFromRoute(newAppView, newActiveTab);
    if (window.location.pathname !== targetPath) {
      window.history.pushState({}, '', targetPath + window.location.search);
    }
  };

  const handleTabChange = (tab) => {
    navigateTo('mapa', tab);
  };

  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromPath(window.location.pathname);
      setAppView(route.appView);
      setActiveTab(route.activeTab);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Filter state
  const [filters, setFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    distrito: 'Todos'
  });
  const [appliedFilters, setAppliedFilters] = useState({
    fecha_inicio: '',
    fecha_fin: '',
    distrito: 'Todos'
  });

  // App Data state
  const [pacientes, setPacientes] = useState([]);
  const [distritos, setDistritos] = useState([]);
  const [enfermedades, setEnfermedades] = useState([]);

  // Modals Open state
  const [isUnidadOpen, setIsUnidadOpen] = useState(false);
  const [isEnfermedadOpen, setIsEnfermedadOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [editingPaciente, setEditingPaciente] = useState(null);

  // Initialize filters as empty on mount to show all cases by default
  useEffect(() => {
    setFilters({ fecha_inicio: '', fecha_fin: '', distrito: 'Todos' });
    setAppliedFilters({ fecha_inicio: '', fecha_fin: '', distrito: 'Todos' });
    
    // Set body class for readonly
    if (isReadonly) {
      document.body.classList.add('readonly-mode');
    } else {
      document.body.classList.remove('readonly-mode');
    }
  }, [isReadonly]);

  // Load catalogs (diseases and units) on mount
  useEffect(() => {
    loadCatalogs();
  }, []);

  // Fetch patient data when applied filters change
  useEffect(() => {
    loadData(appliedFilters);
  }, [appliedFilters]);

  const loadCatalogs = () => {
    unidadesService.getUnidades()
      .then(data => setDistritos(data))
      .catch(err => console.error('Error loading distritos:', err));

    enfermedadesService.getEnfermedades()
      .then(data => setEnfermedades(data))
      .catch(err => console.error('Error loading enfermedades:', err));
  };

  const loadData = (filterObj) => {
    const apiFilters = {
      fecha_inicio: filterObj.fecha_inicio,
      fecha_fin: filterObj.fecha_fin
    };
    pacientesService.getPacientes(apiFilters)
      .then(data => setPacientes(data))
      .catch(err => console.error('Error loading pacientes:', err));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const handleClearFilters = () => {
    const cleared = { fecha_inicio: '', fecha_fin: '', distrito: 'Todos' };
    setFilters(cleared);
    setAppliedFilters(cleared);
  };

  const handleCreatePaciente = (payload, callback) => {
    pacientesService.createPaciente(payload)
      .then(data => {
        if (data.success) {
          alert('¡Paciente registrado con éxito!');
          callback();
          loadData(appliedFilters);
          navigateTo('mapa', 'map');
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => alert('Error de conexión al registrar.'));
  };

  const handleUpdatePaciente = (id, payload, callback) => {
    pacientesService.updatePaciente(id, payload)
      .then(data => {
        if (data.success) {
          alert('¡Paciente actualizado con éxito!');
          callback();
          setEditingPaciente(null);
          loadData(appliedFilters);
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => alert('Error de conexión al actualizar.'));
  };

  const handleDeletePaciente = (id) => {
    if (window.confirm('¿Está seguro de que desea eliminar este paciente? Esta acción no se puede deshacer.')) {
      pacientesService.deletePaciente(id)
        .then(data => {
          if (data.success) {
            loadData(appliedFilters);
          } else {
            alert('Error al eliminar: ' + data.error);
          }
        })
        .catch(err => alert('Error de conexión al eliminar.'));
    }
  };

  const handleCreateUnidad = (payload, callback) => {
    unidadesService.createUnidad(payload)
      .then(data => {
        if (data.success) {
          alert('¡Nueva unidad operativa registrada!');
          callback();
          loadCatalogs();
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => alert('Error de conexión al crear unidad.'));
  };

  const handleCreateEnfermedad = (payload, callback) => {
    enfermedadesService.createEnfermedad(payload)
      .then(data => {
        if (data.success) {
          alert('¡Nueva enfermedad registrada!');
          callback();
          loadCatalogs();
        } else {
          alert('Error: ' + data.error);
        }
      })
      .catch(err => alert('Error de conexión al crear enfermedad.'));
  };

  // Filter patients by selected district in applied filters
  const filteredPacientesByDistrito = React.useMemo(() => {
    if (!appliedFilters.distrito || appliedFilters.distrito === 'Todos') {
      return pacientes;
    }
    return pacientes.filter(p => p.distrito_operativo === appliedFilters.distrito);
  }, [pacientes, appliedFilters.distrito]);

  // Compute statistics dynamically on the frontend based on the filtered patients list
  const computedStats = React.useMemo(() => {
    const list = filteredPacientesByDistrito;
    const total = list.length;
    const graves = list.filter(p => p.nivel_gravedad === 'grave').length;
    const normales = list.filter(p => p.nivel_gravedad === 'normal').length;
    
    const dates = list.map(p => p.fecha_consulta).filter(Boolean);
    const ultimo_reporte = dates.length > 0 
      ? dates.reduce((latest, d) => d > latest ? d : latest, dates[0]) 
      : '';

    // Count by barrio
    const barrioCounts = {};
    list.forEach(p => {
      const b = p.direccion_barrio || 'Sin Barrio';
      barrioCounts[b] = (barrioCounts[b] || 0) + 1;
    });
    const por_barrio = Object.entries(barrioCounts)
      .map(([barrio, count]) => ({ barrio, total: count }))
      .sort((a, b) => b.total - a.total);

    // Count by disease
    const enfCounts = {};
    list.forEach(p => {
      const name = p.nombre_enfermedad || 'Sin Enfermedad';
      const color = p.color_mapa || '#3388ff';
      if (!enfCounts[name]) {
        enfCounts[name] = { nombre: name, color_mapa: color, total: 0 };
      }
      enfCounts[name].total += 1;
    });
    const por_enfermedad = Object.values(enfCounts).sort((a, b) => b.total - a.total);

    return {
      total,
      graves,
      normales,
      ultimo_reporte,
      por_barrio,
      por_enfermedad
    };
  }, [filteredPacientesByDistrito]);

  // Helper formatting for dates in the map badge
  const getBadgeText = () => {
    const { fecha_inicio: start, fecha_fin: end, distrito } = appliedFilters;
    const count = filteredPacientesByDistrito.length;
    const scopeStr = distrito && distrito !== 'Todos' ? ` en ${distrito}` : '';
    
    if (start && end) {
      const formatDateStr = (str) => {
        const [y, m, d] = str.split('-');
        return `${d}/${m}/${y}`;
      };
      return `📅 Mostrando casos del ${formatDateStr(start)} al ${formatDateStr(end)}${scopeStr} — ${count} casos`;
    }
    return `Mostrando todos los casos${scopeStr} — ${count} casos`;
  };

  // ---- Landing screen ----
  if (appView === 'landing') {
    return (
      <LandingPage
        onSelectMapa={() => navigateTo('mapa', 'dashboard')}
        onSelectControl={() => navigateTo('control', 'dashboard')}
      />
    );
  }

  // ---- Under construction ----
  if (appView === 'control') {
    return (
      <UnderConstructionPage onBack={() => navigateTo('landing')} />
    );
  }

  // ---- Main app (Mapa de Vectores) ----
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <Header
        isReadonly={isReadonly}
        onShareClick={() => setIsShareOpen(true)}
      />

      <Tabs
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        isReadonly={isReadonly}
      />

      {/* Show Date and District Filters for Map and Table Tabs */}
      {activeTab !== 'form' && (
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      )}

      {/* Tab Pages */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'dashboard' && (
          <AnalyticsDashboardPage
            pacientes={filteredPacientesByDistrito}
            stats={computedStats}
          />
        )}

        {activeTab === 'map' && (
          <DashboardPage
            pacientes={filteredPacientesByDistrito}
            stats={computedStats}
            enfermedades={enfermedades}
            hasCases={filteredPacientesByDistrito.length > 0}
            badgeText={getBadgeText()}
          />
        )}

        {activeTab === 'table' && (
          <TablePage
            pacientes={filteredPacientesByDistrito}
            onEdit={(p) => setEditingPaciente(p)}
            onDelete={handleDeletePaciente}
            isReadonly={isReadonly}
          />
        )}

        {activeTab === 'form' && !isReadonly && (
          <RegisterPage
            distritos={distritos}
            enfermedades={enfermedades}
            onSubmit={handleCreatePaciente}
            onAddUnidad={() => setIsUnidadOpen(true)}
            onAddEnfermedad={() => setIsEnfermedadOpen(true)}
          />
        )}
      </div>

      {/* Catalog & Utility Modals */}
      <UnidadModal
        isOpen={isUnidadOpen}
        onClose={() => setIsUnidadOpen(false)}
        onSubmit={handleCreateUnidad}
      />

      <EnfermedadModal
        isOpen={isEnfermedadOpen}
        onClose={() => setIsEnfermedadOpen(false)}
        onSubmit={handleCreateEnfermedad}
      />

      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />

      {/* Edit Paciente Modal */}
      <EditPacienteModal
        isOpen={editingPaciente !== null}
        onClose={() => setEditingPaciente(null)}
        paciente={editingPaciente}
        distritos={distritos}
        enfermedades={enfermedades}
        onSubmit={handleUpdatePaciente}
      />
    </div>
  );
}
