// Base URL detection
// In development, Vite will proxy '/api/*' to the local PHP server
// In production, we assume the React app is served alongside the PHP api folder
const getBaseUrl = () => {
  if (import.meta.env.DEV) {
    return '/api'; // Configured via Vite proxy
  }
  // Relativo a la ubicación de despliegue en producción (ej. http://localhost/dengue-map/api/)
  return './api'; 
};

export const API_BASE_URL = getBaseUrl();

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = `HTTP error! Status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (e) {
      // Ignorar si no es JSON
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async get(endpoint, params = {}) {
    const url = new URL(`${API_BASE_URL}/${endpoint}`, window.location.origin);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        url.searchParams.append(key, params[key]);
      }
    });
    
    // Si es en producción y usamos paths relativos, el constructor de URL de arriba con window.location.origin puede cambiar la ruta absoluta
    // Por eso, para producción o rutas locales, es más seguro usar un string directo si es path relativo
    const fetchUrl = import.meta.env.DEV 
      ? `${API_BASE_URL}/${endpoint}${url.search}`
      : `${API_BASE_URL}/${endpoint}${url.search}`;

    const response = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      }
    });
    return handleResponse(response);
  },

  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async put(endpoint, id, data) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}?id=${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  async delete(endpoint, id) {
    const response = await fetch(`${API_BASE_URL}/${endpoint}?id=${id}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
      }
    });
    return handleResponse(response);
  }
};
