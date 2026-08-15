import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AlertProvider } from './context/AlertContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { GOOGLE_CLIENT_ID } from './config/googleAuth.js'

// Limpiar Service Workers antiguos (incluyendo "AutoCare") y registrar el correcto
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      // 1. Desregistrar TODOS los Service Workers activos en este origen
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
        console.log('Service Worker antiguo desregistrado:', registration.scope);
      }

      // 2. Limpiar TODOS los caches del navegador
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('Cachés limpiados correctamente.');

      // 3. Registrar el Service Worker correcto de este sistema
      const reg = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker de Vigilancia Epidemiológica registrado:', reg.scope);
    } catch (err) {
      console.error('Error al gestionar el Service Worker:', err);
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AlertProvider>
        <App />
      </AlertProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
