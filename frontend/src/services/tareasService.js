import api from './api';

const API_PATH = '/tareas';

export const getTareas = async () => {
  const res = await api.get(API_PATH);
  return res.data;
};

export const createTarea = async (tareaData) => {
  const res = await api.post(API_PATH, tareaData);
  return res.data;
};

export const deleteTarea = async (id) => {
  const res = await api.delete(`${API_PATH}/${id}`);
  return res.data;
};

const tareasService = { getTareas, createTarea, deleteTarea };
export default tareasService;
