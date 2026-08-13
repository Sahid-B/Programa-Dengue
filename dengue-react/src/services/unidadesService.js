import { api } from './api';

export const unidadesService = {
  getUnidades() {
    return api.get('unidades.php');
  },

  createUnidad(data) {
    return api.post('unidades.php', data);
  }
};
