import mongoose from "mongoose";

const registroSchema = new mongoose.Schema(
  {
    // Relacionamos este registro con el ID (ObjectId) de la habitación rentada
    habitacion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Habitacion",
      required: true,
    },
    tipoTiempo: {
      type: String,
      required: true,
      enum: ["2horas", "4horas", "noche"],
    },
    horaEntrada: {
      type: Date,
      default: Date.now, // Toma la fecha y hora exacta del servidor automáticamente
    },
    horaSalidaProyectada: {
      type: Date,
      required: true, // Hora calculada en la que se le acaba el tiempo al cliente
    },
    horaSalidaReal: {
      type: Date, // Se llenará cuando el cliente se vaya o se termine la estancia manualmente
    },
    estadoEstancia: {
      type: String,
      default: "activa",
      enum: ["activa", "finalizada", "tiempo_extra"],
    },

    // Agrupamos la información del vehículo y la llegada
    detallesVehiculo: {
      tipoLlegada: {
        type: String,
        enum: ["auto", "moto", "a_pie"],
        required: true,
      },
      toallasEntregadas: { type: Number, default: 0 },
      marca: { type: String }, // Solo aplicará para auto
      color: { type: String }, // Aplicará para auto y moto
      placas: { type: String }, // Aplicará para auto y moto
    },

    // Cuestiones financieras de este registro específico
    costoBase: { type: Number, required: true },
    costoExtra: { type: Number, default: 0 },
    totalPagado: { type: Number, required: true },
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia"],
      default: "efectivo",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Registro", registroSchema);
