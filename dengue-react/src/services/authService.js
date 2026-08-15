import { api } from './api';

export const authService = {
  login(correo, contrasena) {
    return api.post('login.php', { correo, contrasena });
  },

  register(nombre, apellido, correo, contrasena) {
    return api.post('register.php', { nombre, apellido, correo, contrasena });
  }
};
