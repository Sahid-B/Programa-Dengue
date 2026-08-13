import { api } from './api';

export const enfermedadesService = {
  getEnfermedades() {
    return api.get('enfermedades.php');
  },

  createEnfermedad(data) {
    return api.post('enfermedades.php', data);
  }
};
