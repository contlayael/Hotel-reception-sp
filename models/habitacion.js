// Importamos mongoose para definir las reglas de nuestra base de datos
import mongoose from "mongoose";

// Creamos el "Schema" (Esquema/Plantilla) para las habitaciones
const habitacionSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true, // Es obligatorio
      unique: true, // No pueden existir dos habitaciones con el mismo número (Ej. dos "101")
    },
    tipo: {
      type: String,
      required: true,
      // enum restringe los valores a solo estas tres opciones exactas
      enum: ["jacuzzi", "cochera", "pie_moto"],
    },
    estado: {
      type: String,
      default: "disponible", // Cuando se crea una habitación, nace como disponible
      enum: ["disponible", "ocupada", "limpieza", "mantenimiento"],
    },
    detalles: {
      type: String,
      default: "", // Campo opcional para notas de la recepcionista o admin
    },
  },
  {
    // Esto agrega automáticamente la fecha de creación y de última actualización
    timestamps: true,
  },
);

// Exportamos el modelo para poder usarlo en otras partes de nuestro servidor
export default mongoose.model("Habitacion", habitacionSchema);
