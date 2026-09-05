import mongoose from "mongoose";
import dotenv from "dotenv";
import Habitacion from "./models/Habitacion.js";
import Registro from "./models/Registro.js"; // NUEVO: Importamos el modelo de Registro

// Cargamos tus variables de entorno para conectarnos a tu Mongo
dotenv.config();

const habitacionesReales = [
  { numero: "1", tipo: "cochera", estado: "disponible" },
  { numero: "2", tipo: "cochera", estado: "disponible" },
  { numero: "3", tipo: "cochera", estado: "disponible" },
  { numero: "4", tipo: "cochera", estado: "disponible" },
  { numero: "5", tipo: "cochera", estado: "disponible" },
  { numero: "6", tipo: "cochera", estado: "disponible" },
  { numero: "7", tipo: "cochera", estado: "disponible" },
  { numero: "8", tipo: "cochera", estado: "disponible" },
  { numero: "9", tipo: "cochera", estado: "disponible" },
  { numero: "10", tipo: "cochera", estado: "disponible" },
  { numero: "11", tipo: "cochera", estado: "disponible" },
  { numero: "12", tipo: "cochera", estado: "disponible" },
  { numero: "13", tipo: "cochera", estado: "disponible" },
  { numero: "14", tipo: "cochera", estado: "disponible" },
  { numero: "15", tipo: "cochera", estado: "disponible" },
  // Habitaciones con Jacuzzi
  { numero: "16", tipo: "jacuzzi", estado: "disponible" },
  { numero: "17", tipo: "jacuzzi", estado: "disponible" },
  { numero: "18", tipo: "jacuzzi", estado: "disponible" },
  { numero: "19", tipo: "jacuzzi", estado: "disponible" },
  { numero: "20", tipo: "jacuzzi", estado: "disponible" },
];

const sembrarBaseDeDatos = async () => {
  try {
    // 1. Conectamos a la base de datos
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔌 Conectado a MongoDB Atlas...");

    // 2. LIMPIEZA TOTAL: Borramos los historiales viejos
    await Registro.deleteMany();
    console.log("🗑️ Todos los registros antiguos y cortes de caja eliminados.");

    // 3. Borramos las habitaciones para evitar duplicados
    await Habitacion.deleteMany();
    console.log("🗑️ Habitaciones antiguas eliminadas.");

    // 4. Insertamos las 20 habitaciones reales
    await Habitacion.insertMany(habitacionesReales);
    console.log("✅ ¡Las 20 habitaciones se han creado con éxito!");

    // 5. Cerramos la conexión
    process.exit();
  } catch (error) {
    console.error("❌ Error al limpiar y sembrar la base de datos:", error);
    process.exit(1);
  }
};

sembrarBaseDeDatos();