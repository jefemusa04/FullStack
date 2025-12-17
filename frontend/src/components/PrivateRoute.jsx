import React, { useContext } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext'; 

const PrivateRoute = ({ allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);
    const location = useLocation();

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando autenticación...</div>;
    }

    // Si no hay usuario, mandar al Login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si el rol no está autorizado
    if (allowedRoles && !allowedRoles.includes(user.rol)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PrivateRoute;