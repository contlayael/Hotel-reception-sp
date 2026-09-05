import Registro from "../models/Registro.js";
import Habitacion from "../models/Habitacion.js";

// 1. Crear Check-in
export const crearRegistro = async (req, res) => {
  try {
    const {
      habitacionId,
      tipoTiempo,
      tipoLlegada,
      toallasEntregadas,
      marca,
      color,
      placas,
      metodoPago,
    } = req.body;

    const habitacion = await Habitacion.findById(habitacionId);
    if (!habitacion)
      return res.status(404).json({ mensaje: "La habitación no existe" });
    if (habitacion.estado !== "disponible")
      return res
        .status(400)
        .json({ mensaje: "La habitación no está disponible actualmente" });

    let costoBase = 0;
    if (tipoTiempo === "2horas") costoBase = 200;
    else if (tipoTiempo === "4horas")
      costoBase = habitacion.tipo === "jacuzzi" ? 400 : 300;
    else if (tipoTiempo === "noche") costoBase = 500;

    const horaEntrada = new Date();
    const horaSalidaProyectada = new Date(horaEntrada);

    if (tipoTiempo === "2horas")
      horaSalidaProyectada.setHours(horaEntrada.getHours() + 2);
    else if (tipoTiempo === "4horas")
      horaSalidaProyectada.setHours(horaEntrada.getHours() + 4);
    else if (tipoTiempo === "noche")
      horaSalidaProyectada.setHours(horaEntrada.getHours() + 12);

    const nuevoRegistro = new Registro({
      habitacion: habitacionId,
      tipoTiempo,
      horaEntrada,
      horaSalidaProyectada,
      detallesVehiculo: {
        tipoLlegada,
        toallasEntregadas,
        marca,
        color,
        placas,
      },
      costoBase,
      totalPagado: costoBase,
      metodoPago: metodoPago || "efectivo", // Si no lo envían, por defecto es efectivo
    });

    const registroGuardado = await nuevoRegistro.save();

    habitacion.estado = "ocupada";
    await habitacion.save();

    res.status(201).json(registroGuardado);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al procesar el check-in", error: error.message });
  }
};

// 2. Obtener registros activos
export const obtenerRegistrosActivos = async (req, res) => {
  try {
    // Buscamos registros que no estén finalizados
    const registros = await Registro.find({
      estadoEstancia: { $ne: "finalizada" },
    }).populate("habitacion");
    res.status(200).json(registros);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al obtener registros", error: error.message });
  }
};

// 3. NUEVO: Agregar una hora extra (Cobra 100 pesos)
export const agregarTiempoExtra = async (req, res) => {
  try {
    const { habitacionId } = req.params; // ⬅️ Recibimos el ID de la habitación

    // Buscamos el registro activo de esa habitación
    const registro = await Registro.findOne({
      habitacion: habitacionId,
      estadoEstancia: { $in: ["activa", "tiempo_extra"] }, // Puede estar activa o ya con tiempo extra
    });

    if (!registro)
      return res
        .status(404)
        .json({ mensaje: "No hay estancia activa en esta habitación" });

    // Sumamos 1 hora al tiempo que ya tenía
    registro.horaSalidaProyectada.setHours(
      registro.horaSalidaProyectada.getHours() + 1,
    );

    // Sumamos los 100 pesos y cambiamos el estado
    registro.costoExtra += 100;
    registro.totalPagado = registro.costoBase + registro.costoExtra;
    registro.estadoEstancia = "tiempo_extra";

    const registroActualizado = await registro.save();
    res.status(200).json(registroActualizado);
  } catch (error) {
    res
      .status(500)
      .json({ mensaje: "Error al agregar tiempo extra", error: error.message });
  }
};

// 4. NUEVO: Finalizar Estancia (Check-out)
export const finalizarEstancia = async (req, res) => {
  try {
    const { habitacionId } = req.params; // ⬅️ Recibimos el ID de la habitación

    // Buscamos el registro activo de esa habitación
    const registro = await Registro.findOne({
      habitacion: habitacionId,
      estadoEstancia: { $in: ["activa", "tiempo_extra"] },
    });

    if (!registro)
      return res
        .status(404)
        .json({ mensaje: "No hay estancia activa en esta habitación" });

    // Marcamos la salida y cerramos el registro
    registro.estadoEstancia = "finalizada";
    registro.horaSalidaReal = new Date();
    await registro.save();

    // Ponemos la habitación en limpieza
    const habitacion = await Habitacion.findById(registro.habitacion);
    habitacion.estado = "limpieza";
    await habitacion.save();

    res.status(200).json({
      mensaje: "Estancia finalizada con éxito. Habitación en limpieza.",
      registro,
    });
  } catch (error) {
    res.status(500).json({
      mensaje: "Error al finalizar la estancia",
      error: error.message,
    });
  }
};
