import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { authService } from '../services/authService';
import { useAlert } from '../context/AlertContext';
import { useGoogleLogin } from '@react-oauth/google';

// Google Icon SVG
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18">
    <path fill="#fbbb00" d="M113.47 309.408 95.648 375.94l-65.139 1.378C11.042 341.211 0 299.9 0 256c0-42.451 10.324-82.483 28.624-117.732h.014L86.63 148.9l25.404 57.644c-5.317 15.501-8.215 32.141-8.215 49.456.002 18.792 3.406 36.797 9.651 53.408z"/>
    <path fill="#518ef8" d="M507.527 208.176C510.467 223.662 512 239.655 512 256c0 18.328-1.927 36.206-5.598 53.451-12.462 58.683-45.025 109.925-90.134 146.187l-.014-.014-73.044-3.727-10.338-64.535c29.932-17.554 53.324-45.025 65.646-77.911h-136.89V208.176h245.899z"/>
    <path fill="#28b446" d="m416.253 455.624.014.014C372.396 490.901 316.666 512 256 512c-97.491 0-182.252-54.491-225.491-134.681l82.961-67.91c21.619 57.698 77.278 98.771 142.53 98.771 28.047 0 54.323-7.582 76.87-20.818l83.383 68.262z"/>
    <path fill="#f14336" d="m419.404 58.936-82.933 67.896C313.136 112.246 285.552 103.82 256 103.82c-66.729 0-123.429 42.957-143.965 102.724l-83.397-68.276h-.014C71.23 56.123 157.06 0 256 0c62.115 0 119.068 22.126 163.404 58.936z"/>
  </svg>
);

// Shared Google login handler: fetches user profile and creates session
async function handleGoogleToken(accessToken, onAuthSuccess, showAlert) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const profile = await res.json();
    const user = {
      nombre: profile.given_name || profile.name?.split(' ')[0] || 'Usuario',
      apellido: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
      correo: profile.email,
      foto: profile.picture,
      googleId: profile.sub
    };
    localStorage.setItem('currentUser', JSON.stringify(user));
    showAlert(`¡Bienvenido, ${user.nombre}!`, 'success');
    onAuthSuccess(user);
  } catch {
    showAlert('Error al obtener datos de Google', 'error');
  }
}

export function LoginPage({ onAuthSuccess, onNavigate }) {
  const { showAlert } = useAlert();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await authService.login(correo, contrasena);
      if (data.success) {
        showAlert(`¡Bienvenido de nuevo, ${data.user.nombre}!`, 'success');
        onAuthSuccess(data.user);
      }
    } catch (err) {
      showAlert(err.message || 'Error al iniciar sesión', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: (tokenResponse) => handleGoogleToken(tokenResponse.access_token, onAuthSuccess, showAlert),
    onError: () => showAlert('No se pudo iniciar sesión con Google', 'error'),
  });

  return (
    <div className="auth-page-container">
      {/* Left Pane (Image) */}
      <div className="auth-left-pane">
        <div style={{ maxWidth: '580px', width: '90%', textAlign: 'center', padding: '1rem' }}>
          <img
            src="login.png"
            alt="Login Illustration"
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Right Pane (Form) */}
      <div className="auth-right-pane">
        <div className="auth-form-card">
          {/* Back button */}
          <button
            onClick={() => onNavigate('landing')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              marginBottom: '2rem', padding: 0
            }}
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </button>

          {/* Logo */}
          <img
            src="web-app-manifest-192x192.png"
            alt="Logo"
            style={{ width: '64px', height: '64px', margin: '0 auto 1.25rem auto', display: 'block' }}
          />

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-title)' }}>
            Iniciar Sesión
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 1.5rem 0' }}>
            Ingresa al sistema de vigilancia epidemiológica
          </p>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => loginWithGoogle()}
            className="btn-google-oauth"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <div className="auth-divider">
            <span>o con correo electrónico</span>
          </div>

          <form onSubmit={handleSubmit}>
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
              className="btn-auth-solid"
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Procesando...' : 'Ingresar'}
            </button>
          </form>

          <div className="auth-switch-link">
            <span>¿No tienes una cuenta?</span>{' '}
            <button type="button" onClick={() => onNavigate('register')}>
              Regístrate aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RegisterPage({ onNavigate }) {
  const { showAlert } = useAlert();
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mailRegex.test(correo)) {
      showAlert('Formato de correo electrónico no válido.', 'warning');
      return;
    }
    if (contrasena.length < 6) {
      showAlert('La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }
    setLoading(true);
    try {
      const data = await authService.register(nombre, apellido, correo, contrasena);
      if (data.success) {
        showAlert('¡Cuenta creada exitosamente! Ahora puede iniciar sesión.', 'success');
        onNavigate('login');
      }
    } catch (err) {
      showAlert(err.message || 'Error al crear la cuenta', 'error');
    } finally {
      setLoading(false);
    }
  };

  // For register, Google login creates account directly via profile info
  const registerWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        const profile = await res.json();
        const user = {
          nombre: profile.given_name || profile.name?.split(' ')[0] || 'Usuario',
          apellido: profile.family_name || profile.name?.split(' ').slice(1).join(' ') || '',
          correo: profile.email,
          foto: profile.picture,
          googleId: profile.sub
        };
        localStorage.setItem('currentUser', JSON.stringify(user));
        showAlert(`¡Bienvenido, ${user.nombre}! Cuenta Google vinculada.`, 'success');
        // Navigate back to login which will call onAuthSuccess via the flow
        onNavigate('login');
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
        <div style={{ maxWidth: '580px', width: '90%', textAlign: 'center', padding: '1rem' }}>
          <img
            src="login.png"
            alt="Register Illustration"
            style={{ width: '100%', height: 'auto', display: 'block', objectFit: 'contain' }}
          />
        </div>
      </div>

      {/* Right Pane (Form) */}
      <div className="auth-right-pane">
        <div className="auth-form-card">
          {/* Back button */}
          <button
            onClick={() => onNavigate('landing')}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              marginBottom: '2rem', padding: 0
            }}
          >
            <ArrowLeft size={16} />
            Volver al inicio
          </button>

          {/* Logo */}
          <img
            src="web-app-manifest-192x192.png"
            alt="Logo"
            style={{ width: '64px', height: '64px', margin: '0 auto 1.25rem auto', display: 'block' }}
          />

          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', margin: '0 0 0.5rem 0', fontFamily: 'var(--font-title)' }}>
            Crear Cuenta
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center', margin: '0 0 1.5rem 0' }}>
            Únete a nuestra plataforma de vigilancia de salud
          </p>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={() => registerWithGoogle()}
            className="btn-google-oauth"
          >
            <GoogleIcon />
            Continuar con Google
          </button>

          <div className="auth-divider">
            <span>o con correo electrónico</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="auth-input-group" style={{ flex: 1 }}>
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
              <div className="auth-input-group" style={{ flex: 1 }}>
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
              className="btn-auth-solid"
              style={{ marginTop: '1.5rem' }}
            >
              {loading ? 'Procesando...' : 'Registrarse'}
            </button>
          </form>

          <div className="auth-switch-link">
            <span>¿Ya tienes una cuenta?</span>{' '}
            <button type="button" onClick={() => onNavigate('login')}>
              Inicia sesión aquí
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
