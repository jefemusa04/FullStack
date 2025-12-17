import api from './api';

const BASE_URL = '/alumnos';

// Obtener alumnos de un grupo específico
export const getAlumnosPorGrupo = async (grupoId) => {
    const res = await api.get(`${BASE_URL}/grupo/${grupoId}`);
    return res.data;
};

// Enviamos el objeto completo (nombre, email, password)
export const registrarNuevoAlumno = async (grupoId, alumnoData) => {
    // alumnoData = { nombre, email, password }
    const res = await api.post(`${BASE_URL}/registrar/${grupoId}`, alumnoData);
    return res.data;
};

export const matricularExistente = async (grupoId, email) => {
    // Enviamos solo el email
    const res = await api.put(`${BASE_URL}/matricular/${grupoId}`, { email });
    return res.data;
};

// Desmatricular un alumno (Eliminar)
export const desmatricularAlumno = async (grupoId, estudianteId) => {
    const res = await api.put(`${BASE_URL}/desmatricular/${grupoId}/${estudianteId}`);
    return res.data;
};