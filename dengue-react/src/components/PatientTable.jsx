import React, { useState } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import Chart from 'chart.js/auto';
import { Download, Edit, Trash2, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useAlert } from '../context/AlertContext';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem' }}>Registro de Pacientes (Tabla)</h2>
        
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={handleSearchChange}
              style={{
                background: 'rgba(0, 0, 0, 0.2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                padding: '0.4rem 0.75rem 0.4rem 2.25rem',
                fontFamily: 'var(--font-body)',
                fontSize: '0.85rem',
                outline: 'none',
                width: '220px'
              }}
            />
          </div>

          <button
            onClick={handleExportExcel}
            disabled={exporting}
            style={{
              backgroundColor: '#107c41',
              color: 'white',
              border: 'none',
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 'bold',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#0b5b30'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#107c41'}
          >
            <Download size={14} />
            {exporting ? 'Exportando...' : 'Exportar a Excel'}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', minWidth: 0, minHeight: 0 }}>
        <table className="barrios-table cases-table" style={{ width: '100%' }}>
          <thead style={{ position: 'sticky', top: 0, zIndex: 5, background: '#121214' }}>
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
                <td colSpan={isReadonly ? 14 : 15} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                  No hay casos para mostrar
                </td>
              </tr>
            ) : (
              paginatedPacientes.map(p => (
                <tr key={p.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{p.fecha_consulta}</td>
                  <td>{p.distrito_operativo || '--'}</td>
                  <td>{p.unidad_operativa || '--'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <span className="color-dot" style={{ backgroundColor: p.color_mapa || '#3388ff', marginRight: '6px' }}></span>
                    {p.nombre_enfermedad}
                  </td>
                  <td><code>{p.cie_10 || '--'}</code></td>
                  <td style={{ fontWeight: '600' }}>{p.nombre_completo}</td>
                  <td>{p.cedula || '--'}</td>
                  <td>{p.telefono || '--'}</td>
                  <td>{p.edad}</td>
                  <td>{p.sexo}</td>
                  <td>{p.direccion_barrio}</td>
                  <td>{parseFloat(p.latitud).toFixed(5)}</td>
                  <td>{parseFloat(p.longitud).toFixed(5)}</td>
                  <td style={{ minWidth: '150px', fontSize: '0.8rem' }}>{p.observaciones || '--'}</td>
                  {!isReadonly && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '1.25rem',
        paddingTop: '1rem',
        borderTop: '1px solid var(--border)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Page size selector & status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <span>Mostrar:</span>
          <select
            value={pageSize}
            onChange={handlePageSizeChange}
            style={{
              background: 'rgba(15, 23, 42, 0.6)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              padding: '0.3rem 1.8rem 0.3rem 0.5rem',
              outline: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-body)',
              appearance: 'none',
              backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2394a3b8\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 0.5rem center',
              backgroundSize: '1em'
            }}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              onClick={handleFirstPage}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                padding: '0.35rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (currentPage !== 1) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                padding: '0.35rem',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (currentPage !== 1) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
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
                    style={{
                      background: isSelected ? 'var(--primary)' : 'transparent',
                      border: '1px solid',
                      borderColor: isSelected ? 'var(--primary)' : 'var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: isSelected ? '#0c111d' : 'var(--text-primary)',
                      padding: '0.35rem 0.7rem',
                      fontWeight: 'bold',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--primary)'; }}
                    onMouseOut={(e) => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                  >
                    {p}
                  </button>
                );
              }
              if (p === 2 || p === totalPages - 1) {
                return <span key={p} style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0 0.2rem' }}>...</span>;
              }
              return null;
            })}

            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                padding: '0.35rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={handleLastPage}
              disabled={currentPage === totalPages}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                padding: '0.35rem',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (currentPage !== totalPages) e.currentTarget.style.borderColor = 'var(--primary)'; }}
              onMouseOut={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
