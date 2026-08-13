import React from 'react';
import { LayoutDashboard, Map, Table, UserPlus } from 'lucide-react';

export default function Tabs({ activeTab, setActiveTab, isReadonly }) {
  return (
    <div className="tabs-container">
      <div className="tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={16} />
          Dashboard
        </button>

        <button
          className={`tab-btn ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          <Map size={16} />
          Mapa de Casos
        </button>
        
        <button
          className={`tab-btn ${activeTab === 'table' ? 'active' : ''}`}
          onClick={() => setActiveTab('table')}
        >
          <Table size={16} />
          Tabla de Casos
        </button>
        
        {!isReadonly && (
          <button
            className={`tab-btn ${activeTab === 'form' ? 'active' : ''}`}
            onClick={() => setActiveTab('form')}
          >
            <UserPlus size={16} />
            Registrar Paciente
          </button>
        )}
      </div>
    </div>
  );
}
