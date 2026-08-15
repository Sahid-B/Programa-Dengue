import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';
import { Download, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAlert } from '../../context/AlertContext';
import styles from './PatientTable.module.css';

export default function PatientTable({ pacientes, onEdit, onDelete, isReadonly }) {
  const { showAlert } = useAlert();
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter patients by search query
  const filteredPacientes = pacientes.filter(p => {
    const q = search.toLowerCase();
    return (
      (p.nombre_completo || '').toLowerCase().includes(q) ||
      (p.cedula || '').includes(q) ||
      (p.direccion_barrio || '').toLowerCase().includes(q) ||
      (p.nombre_enfermedad || '').toLowerCase().includes(q) ||
      (p.unidad_operativa || '').toLowerCase().includes(q)
    );
  });

  // Calculate Pagination values
  const totalItems = filteredPacientes.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedPacientes = filteredPacientes.slice(startIndex, startIndex + pageSize);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handlePageSizeChange = (e) => {
    setPageSize(parseInt(e.target.value));
    setCurrentPage(1); // Reset to page 1 on page size change
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  // Generate Excel report with aggregate data and Chart.js graphics
  const handleExportExcel = async () => {
    if (pacientes.length === 0) {
      showAlert('No hay datos para exportar.', 'warning');
      return;
    }

    setExporting(true);

    try {
      // 1. Calculate Aggregates
      const barriosDengueCount = {};
      const enfermedadesCount = {};

      pacientes.forEach(p => {
        const barrio = p.direccion_barrio || 'Sin Barrio';
        const enf = p.nombre_enfermedad || 'Sin Enfermedad';
        
        // Count for all diseases
        enfermedadesCount[enf] = (enfermedadesCount[enf] || 0) + 1;

        // Count for Dengue in barrios
        if (enf.toLowerCase().includes('dengue')) {
          barriosDengueCount[barrio] = (barriosDengueCount[barrio] || 0) + 1;
        }
      });

      // Helper function to render a chart into Base64
      const generateChartBase64 = async (title, labels, data, color) => {
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');

        // Fill background white
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const chart = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: labels,
            datasets: [{
              label: 'Total de Casos',
              data: data,
              backgroundColor: color.bg,
              borderColor: color.border,
              borderWidth: 1
            }]
          },
          options: {
            animation: false,
            responsive: false,
            plugins: {
              legend: { display: false },
              title: { display: true, text: title, font: { size: 16 } }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });

        // Wait for rendering
        await new Promise(resolve => setTimeout(resolve, 150));

        const base64Image = chart.toBase64Image();
        chart.destroy();
        
        return base64Image.replace(/^data:image\/(png|jpg);base64,/, "");
      };

      // Generate charts in Base64
      const base64Barrios = await generateChartBase64(
        'Casos por Barrio (SOLO DENGUE)',
        Object.keys(barriosDengueCount),
        Object.values(barriosDengueCount),
        { bg: '#e74c3c', border: '#c0392b' }
      );

      const base64Enf = await generateChartBase64(
        'Total de Casos por Enfermedad (TODAS)',
        Object.keys(enfermedadesCount),
        Object.values(enfermedadesCount),
        { bg: '#3498db', border: '#2980b9' }
      );

      // Create Excel Workbook
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Sistema de Vigilancia';
      workbook.created = new Date();

      // Sheet 1: Summary & Charts
      const sheetResumen = workbook.addWorksheet('Resumen y Gráficos');

      sheetResumen.getCell('A1').value = 'Resumen por Enfermedad';
      sheetResumen.getCell('A1').font = { bold: true, size: 14 };
      sheetResumen.getCell('A2').value = 'Enfermedad';
      sheetResumen.getCell('B2').value = 'Total Casos';
      sheetResumen.getRow(2).font = { bold: true };

      let rowOffset = 3;
      for (const [enf, count] of Object.entries(enfermedadesCount)) {
        sheetResumen.getCell(`A${rowOffset}`).value = enf;
        sheetResumen.getCell(`B${rowOffset}`).value = count;
        rowOffset++;
      }
      
      rowOffset++; // Blank row

      sheetResumen.getCell(`A${rowOffset}`).value = 'Resumen por Barrio (Solo Dengue)';
      sheetResumen.getCell(`A${rowOffset}`).font = { bold: true, size: 14 };
      rowOffset++;
      sheetResumen.getCell(`A${rowOffset}`).value = 'Barrio';
      sheetResumen.getCell(`B${rowOffset}`).value = 'Total Casos Dengue';
      sheetResumen.getRow(rowOffset).font = { bold: true };
      rowOffset++;

      for (const [barrio, count] of Object.entries(barriosDengueCount)) {
        sheetResumen.getCell(`A${rowOffset}`).value = barrio;
        sheetResumen.getCell(`B${rowOffset}`).value = count;
        rowOffset++;
      }

      sheetResumen.getColumn('A').width = 40;
      sheetResumen.getColumn('B').width = 20;

      // Add chart 1
      const imgIdBarrios = workbook.addImage({
        base64: base64Barrios,
        extension: 'png',
      });
      sheetResumen.addImage(imgIdBarrios, {
        tl: { col: 3, row: 1 },
        ext: { width: 500, height: 250 }
      });

      // Add chart 2
      const imgIdEnf = workbook.addImage({
        base64: base64Enf,
        extension: 'png',
      });
      sheetResumen.addImage(imgIdEnf, {
        tl: { col: 3, row: 16 },
        ext: { width: 500, height: 250 }
      });

      // Sheet 2: Raw data
      const sheetDatos = workbook.addWorksheet('Registro Completo');
      
      const columnas = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Fecha Consulta', key: 'fecha_consulta', width: 15 },
        { header: 'Distrito Operativo', key: 'distrito_operativo', width: 25 },
        { header: 'Unidad Operativa', key: 'unidad_operativa', width: 30 },
        { header: 'Enfermedad', key: 'nombre_enfermedad', width: 30 },
        { header: 'CIE-10', key: 'cie_10', width: 10 },
        { header: 'Nombre Completo', key: 'nombre_completo', width: 35 },
        { header: 'Cédula', key: 'cedula', width: 15 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Edad', key: 'edad', width: 10 },
        { header: 'Sexo', key: 'sexo', width: 15 },
        { header: 'Barrio', key: 'direccion_barrio', width: 25 },
        { header: 'Latitud', key: 'latitud', width: 15 },
        { header: 'Longitud', key: 'longitud', width: 15 },
        { header: 'Nivel Gravedad', key: 'nivel_gravedad', width: 15 },
        { header: 'Observaciones', key: 'observaciones', width: 40 }
      ];

      sheetDatos.columns = columnas;
      sheetDatos.getRow(1).font = { bold: true };
      sheetDatos.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };

      pacientes.forEach(p => sheetDatos.addRow(p));

      // Download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const dateStr = new Date().toISOString().split('T')[0];
      saveAs(blob, `Reporte_Dengue_${dateStr}.xlsx`);

    } catch (error) {
      console.error('Error al exportar a Excel:', error);
      showAlert('Hubo un error al generar el archivo Excel.', 'error');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="table-container">
      <div className={styles['table-header-row']}>
        <h2 className={styles['table-title']}>Registro de Pacientes (Tabla)</h2>
        
        <div className={styles['header-actions']}>
          <div className={styles['search-container']}>
            <Search size={16} className={styles['search-icon']} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={handleSearchChange}
              className={styles['search-input']}
            />
          </div>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className={styles['btn-export-excel']}
          >
            <Download size={14} />
            {exporting ? 'Exportando...' : 'Exportar a Excel'}
          </button>
        </div>
      </div>

      <div className={styles['table-scroll']}>
        <table className={`barrios-table cases-table ${styles['table-element']}`}>
          <thead className={styles['thead-sticky']}>
            <tr>
              <th>Fecha Consulta</th>
              <th>Distrito</th>
              <th>Unidad Operativa</th>
              <th>Enfermedad</th>
              <th>CIE-10</th>
              <th>Nombre Completo</th>
              <th>Cédula</th>
              <th>Teléfono</th>
              <th>Edad</th>
              <th>Sexo</th>
              <th>Barrio</th>
              <th>Latitud</th>
              <th>Longitud</th>
              <th>Observaciones</th>
              {!isReadonly && <th>Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {paginatedPacientes.length === 0 ? (
              <tr>
                <td colSpan={isReadonly ? 14 : 15} className={styles['no-data-cell']}>
                  No hay casos para mostrar
                </td>
              </tr>
            ) : (
              paginatedPacientes.map(p => (
                <tr key={p.id}>
                  <td className={styles['nowrap-cell']}>{p.fecha_consulta}</td>
                  <td>{p.distrito_operativo || '--'}</td>
                  <td>{p.unidad_operativa || '--'}</td>
                  <td className={styles['nowrap-cell']}>
                    <span className={`color-dot ${styles['color-dot-margin']}`} style={{ backgroundColor: p.color_mapa || '#3388ff' }}></span>
                    {p.nombre_enfermedad}
                  </td>
                  <td><code>{p.cie_10 || '--'}</code></td>
                  <td className={styles['bold-cell']}>{p.nombre_completo}</td>
                  <td>{p.cedula || '--'}</td>
                  <td>{p.telefono || '--'}</td>
                  <td>{p.edad}</td>
                  <td>{p.sexo}</td>
                  <td>{p.direccion_barrio}</td>
                  <td>{parseFloat(p.latitud).toFixed(5)}</td>
                  <td>{parseFloat(p.longitud).toFixed(5)}</td>
                  <td className={styles['observaciones-cell']}>{p.observaciones || '--'}</td>
                  {!isReadonly && (
                    <td className={styles['nowrap-cell']}>
                      <div className={styles['flex-gap-sm']}>
                        <button
                          className="btn-action btn-edit"
                          onClick={() => onEdit(p)}
                        >
                          <Edit size={12} />
                          Editar
                        </button>
                        <button
                          className="btn-action btn-delete"
                          onClick={() => onDelete(p.id)}
                        >
                          <Trash2 size={12} />
                          Eliminar
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className={styles['pagination-container']}>
        {/* Page size selector & status */}
        <div className={styles['page-size-selector']}>
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            className={styles['select-limit']}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>
            Mostrando {totalItems === 0 ? 0 : startIndex + 1} - {Math.min(startIndex + pageSize, totalItems)} de {totalItems} registros
          </span>
        </div>

        {/* Navigation Buttons */}
        {totalPages > 1 && (
          <div className={styles['pagination-actions']}>
            <button
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              className={styles['pagination-btn']}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={styles['pagination-btn']}
            >
              <ChevronLeft size={16} />
            </button>

            {/* Render page numbers */}
            {Array.from({ length: totalPages }).map((_, i) => {
              const p = i + 1;
              if (p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1) {
                const isSelected = currentPage === p;
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`${styles['page-num-btn']} ${isSelected ? styles['active-page'] : ''}`}
                  >
                    {p}
                  </button>
                );
              }
              if (p === 2 || p === totalPages - 1) {
                return <span key={p} className={styles['ellipsis-span']}>...</span>;
              }
              return null;
            })}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={styles['pagination-btn']}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              className={styles['pagination-btn']}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
