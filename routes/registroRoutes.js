import express from "express";
import {
  crearRegistro,
  obtenerRegistrosActivos,
  agregarTiempoExtra,
  finalizarEstancia,
} from "../controllers/registroController.js";
import Registro from "../models/Registro.js";

const router = express.Router();

// ==========================================
// NUEVO: Endpoint para Estadísticas Generales
// ==========================================
router.get("/estadisticas", async (req, res) => {
  try {
    const registros = await Registro.find().populate("habitacion", "numero tipo");

    if (!registros || registros.length === 0) {
      return res.json({ mensaje: "Aún no hay datos suficientes para las estadísticas" });
    }

    // 1. Habitación más rentada
    const conteoHabitaciones = {};
    registros.forEach(reg => {
      if (!reg.habitacion) return; // Ignora registros fantasma
      const num = reg.habitacion.numero;
      conteoHabitaciones[num] = (conteoHabitaciones[num] || 0) + 1;
    });
    
    const clavesHab = Object.keys(conteoHabitaciones);
    const habitacionTop = clavesHab.length > 0 
      ? clavesHab.reduce((a, b) => conteoHabitaciones[a] > conteoHabitaciones[b] ? a : b) 
      : "N/A";

    // 2. Días de mayor ocupación
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const conteoDias = { Domingo: 0, Lunes: 0, Martes: 0, Miércoles: 0, Jueves: 0, Viernes: 0, Sábado: 0 };
    
    registros.forEach(reg => {
      const dia = diasSemana[new Date(reg.createdAt).getDay()];
      conteoDias[dia]++;
    });
    const clavesDias = Object.keys(conteoDias).filter(d => conteoDias[d] > 0);
    const diaTop = clavesDias.length > 0 
      ? clavesDias.reduce((a, b) => conteoDias[a] > conteoDias[b] ? a : b) 
      : "N/A";

    // 3. Horas Pico
    const conteoHoras = {};
    registros.forEach(reg => {
      const hora = new Date(reg.createdAt).getHours();
      const formatoHora = `${hora}:00`;
      conteoHoras[formatoHora] = (conteoHoras[formatoHora] || 0) + 1;
    });
    const clavesHoras = Object.keys(conteoHoras);
    const horaTop = clavesHoras.length > 0 
      ? clavesHoras.reduce((a, b) => conteoHoras[a] > conteoHoras[b] ? a : b) 
      : "N/A";

    // 4. Promedio de tiempo
    const conteoTiempos = { "2horas": 0, "4horas": 0, "noche": 0 };
    registros.forEach(reg => {
      if (conteoTiempos[reg.tipoTiempo] !== undefined) {
        conteoTiempos[reg.tipoTiempo]++;
      }
    });

    res.json({
      totalRegistros: registros.length,
      habitacionTop: { numero: habitacionTop, rentas: conteoHabitaciones[habitacionTop] || 0 },
      diaTop: { dia: diaTop, rentas: conteoDias[diaTop] || 0 },
      horaTop: { hora: horaTop, rentas: conteoHoras[horaTop] || 0 },
      distribucionTiempos: conteoTiempos
    });

  } catch (error) {
    console.error("Error al generar estadísticas:", error);
    res.status(500).json({ mensaje: "Error interno al generar estadísticas" });
  }
});

// ==========================================
// Endpoint para el Corte de Caja por Fecha y Turno
// ==========================================
router.get("/corte", async (req, res) => {
  try {
    // Tomamos la fecha enviada o usamos la de hoy por defecto
    const fechaBase = req.query.fecha || new Date().toISOString().split("T")[0];
    const turno = req.query.turno || "dia"; // "dia" o "noche"

    // Configuramos los horarios exactos basándonos en tu regla de 12 horas
    let inicioTurno = new Date(`${fechaBase}T08:00:00`);
    let finTurno = new Date(`${fechaBase}T20:00:00`);

    if (turno === "noche") {
      // Si es de noche, empieza a las 20:00 y termina a las 08:00 del día siguiente
      inicioTurno = new Date(`${fechaBase}T20:00:00`);
      finTurno = new Date(`${fechaBase}T08:00:00`);
      finTurno.setDate(finTurno.getDate() + 1); // Le sumamos 1 día a la fecha de fin
    }

    const registrosDelTurno = await Registro.find({
      createdAt: { $gte: inicioTurno, $lt: finTurno }
    }).populate("habitacion", "numero tipo");

    let totalEfectivo = 0;
    let totalTarjeta = 0;
    let totalTransferencia = 0;

    registrosDelTurno.forEach(reg => {
      const totalRegistro = (reg.costoBase || 0) + (reg.costoExtra || 0);
      if (reg.metodoPago === "efectivo") totalEfectivo += totalRegistro;
      else if (reg.metodoPago === "tarjeta") totalTarjeta += totalRegistro;
      else if (reg.metodoPago === "transferencia") totalTransferencia += totalRegistro;
    });

    res.json({
      fecha: fechaBase,
      turno: turno,
      horario: `${inicioTurno.toLocaleTimeString()} a ${finTurno.toLocaleTimeString()}`,
      totales: {
        efectivo: totalEfectivo,
        tarjeta: totalTarjeta,
        transferencia: totalTransferencia,
        general: totalEfectivo + totalTarjeta + totalTransferencia
      },
      registros: registrosDelTurno
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
