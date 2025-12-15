import api from './api';

const API_PATH = '/grupos';
const ALUMNOS_PATH = '/alumnos';

export const getGrupos = async () => {
  const res = await api.get(API_PATH);
  return res.data;
};

export const createGrupo = async (grupoData) => {
  const res = await api.post(API_PATH, grupoData);
  return res.data;
};

export const deleteGrupo = async (id) => {
  const res = await api.delete(`${API_PATH}/${id}`);
  return res.data;
};

export const matriculateStudent = async (grupoId, emailEstudiante) => {
  const res = await api.put(`${ALUMNOS_PATH}/matricular/${grupoId}`, { emailEstudiante });
  return res.data;
};

const gruposService = { getGrupos, createGrupo, deleteGrupo, matriculateStudent };
export default gruposService;
