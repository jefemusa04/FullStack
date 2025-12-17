import api from './api';

const API_PATH = '/mensajes';

export const getContactos = async () => {
  const res = await api.get(`${API_PATH}/contactos`);
  return res.data;
};

export const getConversacion = async (destinatarioId) => {
  const res = await api.get(`${API_PATH}/${destinatarioId}`);
  return res.data;
};

export const sendMensaje = async (mensajeData) => {
  const res = await api.post(API_PATH, mensajeData);
  return res.data;
};

const mensajesService = { getContactos,getConversacion, sendMensaje };
export default mensajesService;
