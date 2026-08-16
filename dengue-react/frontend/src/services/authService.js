import { api } from './api';

export const authService = {
  login(correo, contrasena) {
    return api.post('login.php', { correo, contrasena });
  },

  register(nombre, apellido, correo, contrasena) {
    return api.post('register.php', { nombre, apellido, correo, contrasena });
  },

  async loginGoogle(accessToken) {
    const response = await api.post('login_google.php', { access_token: accessToken });
    return response.user;
  },

  async registerGoogle(accessToken) {
    const response = await api.post('register_google.php', { access_token: accessToken });
    return response.user;
  }
};
