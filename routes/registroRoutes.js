import express from "express";
import {
  crearRegistro,
  obtenerRegistrosActivos,
  agregarTiempoExtra,
  finalizarEstancia,
} from "../controllers/registroController.js";
import Registro from "../models/Registro.js";

const router = express.Router();

router.get("/corte", async (req, res) => {
  try {
    // Si Angular nos manda una fecha la usamos, si no, usamos el día de hoy
    // Le agregamos "T00:00:00" para evitar problemas de zonas horarias
    const fechaConsulta = req.query.fecha 
      ? new Date(`${req.query.fecha}T00:00:00`) 
      : new Date();

    const inicioDia = new Date(fechaConsulta);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fechaConsulta);
    finDia.setHours(23, 59, 59, 999);

    const registrosDelDia = await Registro.find({
      createdAt: { $gte: inicioDia, $lte: finDia }
    }).populate("habitacion", "numero tipo");

    let totalEfectivo = 0;
    let totalTarjeta = 0;
    let totalTransferencia = 0;

    registrosDelDia.forEach(reg => {
      const totalRegistro = (reg.costoBase || 0) + (reg.costoExtra || 0);
      if (reg.metodoPago === "efectivo") totalEfectivo += totalRegistro;
      else if (reg.metodoPago === "tarjeta") totalTarjeta += totalRegistro;
      else if (reg.metodoPago === "transferencia") totalTransferencia += totalRegistro;
    });

    res.json({
      // Formateamos la fecha para que se vea bonita en pantalla (ej. 01/09/2026)
      fecha: inicioDia.toLocaleDateString(),
      totales: {
        efectivo: totalEfectivo,
        tarjeta: totalTarjeta,
        transferencia: totalTransferencia,
        general: totalEfectivo + totalTarjeta + totalTransferencia
      },
      registros: registrosDelDia
    });
  } catch (error) {
    console.error("Error al generar corte de caja:", error);
    res.status(500).json({ mensaje: "Error interno al generar el corte" });
  }
});

router.post("/", crearRegistro);
router.get("/activos", obtenerRegistrosActivos);

// Usamos PUT porque estamos "actualizando" un registro existente
// NUEVAS RUTAS (Modificadas para recibir el ID de la habitación)
router.put("/:habitacionId/tiempo-extra", agregarTiempoExtra);
router.put("/:habitacionId/finalizar", finalizarEstancia);



export default router;
