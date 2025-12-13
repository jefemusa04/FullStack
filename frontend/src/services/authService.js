import api from "./api";

// Si tu backend usa /api/auth/login y /api/auth/register, adapta aquí.
export const loginRequest = (email, password) => {
  return api.post("/login", { email, password });
};

export const registerRequest = (payload) => {
  return api.post("/register", payload);
};
