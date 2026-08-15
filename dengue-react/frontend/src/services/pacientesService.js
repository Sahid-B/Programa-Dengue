import { api } from './api';

export const pacientesService = {
  getPacientes(filters = {}) {
    return api.get('pacientes.php', {
      fecha_inicio: filters.fecha_inicio || '',
      fecha_fin: filters.fecha_fin || ''
    });
  },

  getPaciente(id) {
    return api.get('pacientes.php', { id });
  },

  createPaciente(data) {
    return api.post('pacientes.php', data);
  },

  updatePaciente(id, data) {
    return api.put('pacientes.php', id, data);
  },

  deletePaciente(id) {
    return api.delete('pacientes.php', id);
  },

  getEstadisticas(filters = {}) {
    return api.get('estadisticas.php', {
      fecha_inicio: filters.fecha_inicio || '',
      fecha_fin: filters.fecha_fin || ''
    });
  }
};
