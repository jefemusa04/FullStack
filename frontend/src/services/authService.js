import api from "./api";

// Backend en FullStack-main expone rutas bajo /api/usuarios
export const loginRequest = (email, password) => {
  return api.post('/usuarios/login', { email, password });
};

export const registerRequest = (payload) => {
  return api.post('/usuarios', payload);
};
