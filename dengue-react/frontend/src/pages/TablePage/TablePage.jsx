import React from 'react';
import PatientTable from '../../components/PatientTable/PatientTable';
import styles from './TablePage.module.css';

export default function TablePage({ pacientes, onEdit, onDelete, isReadonly }) {
  return (
    <div className={styles.container}>
      <PatientTable
        pacientes={pacientes}
        onEdit={onEdit}
        onDelete={onDelete}
        isReadonly={isReadonly}
      />
    </div>
  );
}
