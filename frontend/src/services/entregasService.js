import api from './api';

const API_PATH = '/entregas';

export const createEntrega = async (entregaData) => {
  const res = await api.post(API_PATH, entregaData);
  return res.data;
};

export const getEntregasByTarea = async (tareaId) => {
  const res = await api.get(`${API_PATH}/tarea/${tareaId}`);
  return res.data;
};

export const calificarEntrega = async (entregaId, calificacionData) => {
  const res = await api.put(`${API_PATH}/${entregaId}/calificar`, calificacionData);
  return res.data;
};

const entregasService = { createEntrega, getEntregasByTarea, calificarEntrega };
export default entregasService;
