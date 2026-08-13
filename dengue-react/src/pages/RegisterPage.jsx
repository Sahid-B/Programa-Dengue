import React from 'react';
import PatientForm from '../components/PatientForm';

export default function RegisterPage({ distritos, enfermedades, onSubmit, onAddUnidad, onAddEnfermedad }) {
  return (
    <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', height: '100%' }}>
      <PatientForm
        distritos={distritos}
        enfermedades={enfermedades}
        onSubmit={onSubmit}
        onAddUnidad={onAddUnidad}
        onAddEnfermedad={onAddEnfermedad}
      />
    </div>
  );
}
