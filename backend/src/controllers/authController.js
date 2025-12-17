const crypto = require('crypto');
const User = require('../models/Usuario');
const nodemailer = require('nodemailer');

// 1. Solicitar recuperación (Genera el token y envía el correo)
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "El correo no está registrado" });

        // Generar token temporal
        const resetToken = crypto.randomBytes(20).toString('hex');

        // Guardar token hasheado y expiración en la DB
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hora de validez
        await user.save();

        // Configuración de OCI Email Delivery
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false, 
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        // URL que apuntará a tu Front-end (React)
        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to: user.email,
            subject: 'Recuperación de Contraseña - Mi App',
            html: `<h3>¿Olvidaste tu contraseña?</h3>
                   <p>Haz clic en este enlace para restablecerla:</p>
                   <a href="${resetUrl}">${resetUrl}</a>`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Correo enviado correctamente" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error en el servidor" });
    }
};

// 2. Restablecer contraseña (Verifica el token y guarda la nueva clave)
exports.resetPassword = async (req, res) => {
    // Hashear el token recibido de la URL para comparar con el de la DB
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() } // Que no haya expirado
    });

    if (!user) return res.status(400).json({ message: "Token inválido o expirado" });

    // Actualizar contraseña y limpiar campos de recuperación
    user.password = req.body.password; // Asegúrate de tener un middleware que cifre con bcrypt
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    module.exports = {
    forgotPassword,
    resetPassword
};

    res.status(200).json({ message: "Contraseña actualizada con éxito" });
};