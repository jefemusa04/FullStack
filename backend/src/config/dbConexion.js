const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // La URI debe estar en tu archivo .env como MONGO_URI
        const conn = await mongoose.connect(process.env.MONGODB_URI); 

        // Eliminamos las funciones de color (.cyan.underline) para evitar el TypeError
        console.log(`MongoDB Conectado: ${conn.connection.host}`);
    } catch (error) {
        // Eliminamos las funciones de color (.red.underline.bold)
        console.error(`Error: ${error.message}`);
        process.exit(1); // Sale del proceso con fallo
    }
};

module.exports = connectDB;