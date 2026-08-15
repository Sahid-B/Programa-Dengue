import React from 'react';
import MapComponent from '../../components/MapComponent/MapComponent';
import StatsPanel from '../../components/StatsPanel/StatsPanel';

export default function DashboardPage({ pacientes, stats, enfermedades, hasCases, badgeText }) {
  return (
    <div className="dashboard-layout">
      <StatsPanel stats={stats} pacientes={pacientes} hasCases={hasCases} />
      <MapComponent pacientes={pacientes} enfermedades={enfermedades} badgeText={badgeText} />
    </div>
  );
}
