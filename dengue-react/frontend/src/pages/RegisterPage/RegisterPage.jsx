import React from 'react';
import PatientForm from '../../components/PatientForm/PatientForm';
import styles from './RegisterPage.module.css';

export default function RegisterPage({ distritos, enfermedades, onSubmit, onAddUnidad, onAddEnfermedad, onAddDistrito }) {
  return (
    <div className={styles.container}>
      <PatientForm
        distritos={distritos}
        enfermedades={enfermedades}
        onSubmit={onSubmit}
        onAddUnidad={onAddUnidad}
        onAddEnfermedad={onAddEnfermedad}
        onAddDistrito={onAddDistrito}
      />
    </div>
  );
}
