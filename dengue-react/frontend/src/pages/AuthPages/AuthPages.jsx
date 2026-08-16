import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../../services/authService';
import { useAlert } from '../../context/AlertContext';
import { useGoogleLogin } from '@react-oauth/google';
import styles from './AuthPages.module.css';

// Simple Inline Google SVG
const GoogleIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

const handleGoogleToken = async (accessToken, onAuthSuccess, showAlert) => {
  try {
    const user = await authService.loginGoogle(accessToken);
    onAuthSuccess(user);
    showAlert('Sesión iniciada con éxito.', 'success');
  } catch (error) {
    console.error(error);
    showAlert('Error al autenticar con Google.', 'error');
  }
};

export default function AuthPages({ view = 'login', onNavigate, onAuthSuccess }) {
  const { showAlert } = useAlert();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'login') {
        const response = await authService.login(correo, contrasena);
        if (response.success && response.user) {
          onAuthSuccess(response.user);
          showAlert('Sesión iniciada con éxito.', 'success');
        } else {
          showAlert('Error al obtener datos del usuario', 'error');
        }
      } else {
        const response = await authService.register(nombre, apellido, correo, contrasena);
        if (response.success && response.user) {
          showAlert('Registro exitoso. Iniciando sesión...', 'success');
          onAuthSuccess(response.user);
        } else {
          showAlert('Error al registrar el usuario', 'error');
        }
      }
    } catch (error) {
      showAlert(error.message || 'Error en el proceso de autenticación', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleToken(tokenResponse.access_token, onAuthSuccess, showAlert),
    onError: () => showAlert('No se pudo iniciar sesión con Google', 'error'),
  });

  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const user = await authService.registerGoogle(tokenResponse.access_token);
        showAlert(`¡Bienvenido, ${user.nombre}! Cuenta Google vinculada.`, 'success');
        onAuthSuccess(user);
      } catch {
        showAlert('Error al obtener datos de Google', 'error');
      }
    },
    onError: () => showAlert('No se pudo registrar con Google', 'error'),
  });

  return (
    <div className="auth-page-container">
      {/* Left Pane (Image) */}
      <div className="auth-left-pane">
        <div className={styles['illustration-container']}>
          <img
            src="login.png"
            alt={view === 'login' ? 'Login Illustration' : 'Register Illustration'}
            className={styles['illustration-img']}
          />
        </div>
      </div>

      {/* Right Pane (Form) */}
      <div className="auth-right-pane">
        <div className="auth-form-card">
          {/* Back button */}
          <button
            onClick={() => onNavigate('landing')}
            className={styles['btn-back']}
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </button>

          {/* Logo */}
          <img
            src="web-app-manifest-192x192.png"
            alt="Logo"
            className={styles['logo-img']}
          />

          <h1 className={styles['auth-title']}>
            {view === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h1>
          <p className={styles['auth-subtitle']}>
            {view === 'login'
              ? 'Ingresa al sistema de vigilancia epidemiológica'
              : 'Únete a nuestra plataforma de vigilancia de salud'}
          </p>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => (view === 'login' ? loginWithGoogle() : registerWithGoogle())}
            className="btn-google-oauth"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <div className="auth-divider">
            <span>o con correo electrónico</span>
          </div>

          <form onSubmit={handleSubmit}>
            {view === 'register' && (
              <div className={styles['input-row']}>
                <div className={`auth-input-group ${styles['flex-col-1']}`}>
                  <label>Nombre *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Juan"
                    required
                    className="auth-field"
                  />
                </div>
                <div className={`auth-input-group ${styles['flex-col-1']}`}>
                  <label>Apellido *</label>
                  <input
                    type="text"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    placeholder="Ej. Pérez"
                    required
                    className="auth-field"
                  />
                </div>
              </div>
            )}

            <div className="auth-input-group">
              <label>Correo Electrónico *</label>
              <input
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                placeholder="ejemplo@correo.com"
                required
                className="auth-field"
              />
            </div>

            <div className="auth-input-group">
              <label>Contraseña *</label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                required
                className="auth-field"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-auth-solid ${styles['submit-btn']}`}
            >
              {loading
                ? 'Procesando...'
                : view === 'login'
                ? 'Ingresar'
                : 'Registrarse'}
            </button>
          </form>

          <div className="auth-switch-link">
            {view === 'login' ? (
              <>
                <span>¿No tienes una cuenta?</span>{' '}
                <button type="button" onClick={() => onNavigate('register')}>
                  Regístrate gratis
                </button>
              </>
            ) : (
              <>
                <span>¿Ya tienes una cuenta?</span>{' '}
                <button type="button" onClick={() => onNavigate('login')}>
                  Inicia sesión aquí
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoginPage(props) {
  return <AuthPages {...props} view="login" />;
}

export function RegisterPage(props) {
  return <AuthPages {...props} view="register" />;
}

