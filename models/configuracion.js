import mongoose from "mongoose";

// Este modelo tendrá un solo registro en la base de datos que controlará los precios globales
const configuracionSchema = new mongoose.Schema(
  {
    precios: {
      jacuzzi: {
        horas4: { type: Number, default: 400 },
        noche: { type: Number, default: 500 },
      },
      cochera: {
        horas2: { type: Number, default: 200 },
        horas4: { type: Number, default: 300 },
        noche: { type: Number, default: 500 },
      },
      pie_moto: {
        horas2: { type: Number, default: 200 },
        horas4: { type: Number, default: 300 },
        noche: { type: Number, default: 500 },
      },
    },
    costoHoraExtra: { type: Number, default: 100 },
    tiempoLimpiezaMinutos: { type: Number, default: 15 },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Configuracion", configuracionSchema);
