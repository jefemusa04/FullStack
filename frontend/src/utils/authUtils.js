// Guardar token y usuario en localStorage
export const saveAuth = (token, user) => {
  if (token) {
    localStorage.setItem('token', token);
  }
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Limpiar autenticación
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Obtener token
export const getToken = () => {
  return localStorage.getItem('token');
};

// Obtener usuario
export const getUser = () => {
  const user = localStorage.getItem('user');
  if (user) {
    try {
      return JSON.parse(user);
    } catch (e) {
      return null;
    }
  }
  return null;
};