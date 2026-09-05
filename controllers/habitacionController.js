// Importamos el modelo que creamos en el paso anterior
// Nota: en Node.js moderno, siempre debemos poner la extensión .js al final
import Habitacion from "../models/Habitacion.js";
import Registro from "../models/Registro.js";

// 1. Función para obtener TODAS las habitaciones (Para pintar el mapa en Angular)
export const obtenerHabitaciones = async (req, res) => {
  try {
    // 1. Traemos todas las habitaciones de la base de datos
    const habitaciones = await Habitacion.find();

    // 2. Traemos todos los registros que estén "activos"
    const registrosActivos = await Registro.find({ estadoEstancia: "activa" });

    // 3. Unimos la información y calculamos el tiempo
    const habitacionesConTiempo = habitaciones.map((hab) => {
      // Convertimos el documento de Mongoose a un objeto normal de JS para poder agregarle variables nuevas
      let habObj = hab.toObject();

      // Si la habitación está ocupada, le buscamos su tiempo
      if (habObj.estado === "ocupada") {
        // Buscamos cuál de los registros activos le pertenece a esta habitación
        const registro = registrosActivos.find(
          (reg) => reg.habitacion.toString() === habObj._id.toString()
        );

        if (registro && registro.horaSalidaProyectada) {
          const ahora = new Date();
          const salida = new Date(registro.horaSalidaProyectada);
          
          // Calculamos la diferencia en milisegundos
          const diferenciaMilisegundos = salida - ahora;

          if (diferenciaMilisegundos > 0) {
            // Convertimos a horas, minutos y segundos
            const horas = Math.floor(diferenciaMilisegundos / (1000 * 60 * 60));
            const minutos = Math.floor((diferenciaMilisegundos % (1000 * 60 * 60)) / (1000 * 60));
            const segundos = Math.floor((diferenciaMilisegundos % (1000 * 60)) / 1000);

            // Le damos formato de dos dígitos (ej. 02:05:09)
            const HH = horas.toString().padStart(2, "0");
            const MM = minutos.toString().padStart(2, "0");
            const SS = segundos.toString().padStart(2, "0");

            // Se lo inyectamos al objeto que se va a Angular
            habObj.tiempoRestante = `${HH}:${MM}:${SS}`;
          } else {
            // Si el tiempo ya pasó
            habObj.tiempoRestante = "00:00:00";
          }
        }
      }

      return habObj;
    });

    // 4. Enviamos las habitaciones vitaminadas al frontend
    res.json(habitacionesConTiempo);
  } catch (error) {
    console.error("Error al obtener habitaciones:", error);
    res.status(500).json({ mensaje: "Error al obtener las habitaciones" });
  }
};

// 2. Función para crear una nueva habitación (Para cuando configures tus 38 habitaciones)
export const crearHabitacion = async (req, res) => {
  try {
    // req.body contiene los datos que nos enviará Angular (ej. número y tipo)
    const nuevaHabitacion = new Habitacion(req.body);

    // .save() lo guarda físicamente en MongoDB
    const habitacionGuardada = await nuevaHabitacion.save();
    res.status(201).json(habitacionGuardada); // 201 significa "Creado con éxito"
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al crear la habitación", error: error.message });
  }
};

// 3. Función para actualizar el estado (ej. de Disponible a Ocupada)
export const actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params; // Sacamos el ID de la URL
    const { estado } = req.body; // Sacamos el nuevo estado del cuerpo de la petición

    // Buscamos por ID y actualizamos solo el estado. { new: true } nos devuelve el dato ya actualizado.
    const habitacionActualizada = await Habitacion.findByIdAndUpdate(
      id,
      { estado },
      { new: true },
    );

    if (!habitacionActualizada) {
      return res.status(404).json({ mensaje: "Habitación no encontrada" });
    }

    res.status(200).json(habitacionActualizada);
  } catch (error) {
    res
      .status(400)
      .json({ mensaje: "Error al actualizar el estado", error: error.message });
  }
};
