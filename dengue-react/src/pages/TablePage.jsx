import React from 'react';
import PatientTable from '../components/PatientTable';

export default function TablePage({ pacientes, onEdit, onDelete, isReadonly }) {
  return (
    <div style={{ flex: 1, padding: '1.5rem', overflow: 'hidden', height: '100%' }}>
      <PatientTable
        pacientes={pacientes}
        onEdit={onEdit}
        onDelete={onDelete}
        isReadonly={isReadonly}
      />
    </div>
  );
}
