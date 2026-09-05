import express from "express";
// Importamos las funciones de nuestro controlador
import {
  obtenerHabitaciones,
  crearHabitacion,
  actualizarEstado,
} from "../controllers/habitacionController.js";
import Habitacion from "../models/Habitacion.js";

const router = express.Router();

// Si Angular hace un GET a /api/habitaciones, ejecutamos obtenerHabitaciones
router.get("/", obtenerHabitaciones);

// Si Angular hace un POST a /api/habitaciones, ejecutamos crearHabitacion
router.post("/", crearHabitacion);

// Si Angular hace un PUT a /api/habitaciones/:id/estado (ej. /api/habitaciones/12345/estado), ejecutamos actualizarEstado
router.put("/:id/estado", actualizarEstado);

// Actualizar únicamente el estado de una habitación
router.patch("/:id/estado", async (req, res) => {
  try {
    const { estado } = req.body;
    // Asumo que tu modelo se llama Habitacion, ajusta si es necesario
    const habitacionActualizada = await Habitacion.findByIdAndUpdate(
      req.params.id,
      { estado: estado },
      { new: true }
    );

    if (!habitacionActualizada) {
      return res.status(404).json({ mensaje: "Habitación no encontrada" });
    }

    res.json({ mensaje: "Estado actualizado correctamente", habitacion: habitacionActualizada });
  } catch (error) {
    console.error("Error al actualizar estado:", error);
    res.status(500).json({ mensaje: "Error interno del servidor" });
  }
});

export default router;
