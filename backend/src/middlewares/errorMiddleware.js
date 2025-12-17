// Middleware para manejar los errores lanzados por los controladores
const errorHandler = (err, req, res, next) => {
    // Si el estado de la respuesta es 200 (éxito), lo cambiamos a 500 (Server Error).
    // Si ya tiene un código de error (400, 401, etc.), se mantiene.
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);

    res.json({
        mensaje: err.message, // Mensaje de error para el cliente
        // Mostrar stack trace solo en entorno de desarrollo (para depuración)
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = {
    errorHandler,
};