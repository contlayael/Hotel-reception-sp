import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";

import dns from "dns"; // ⬅️ NUEVO: Importamos el módulo DNS de Node
// ⬅️ NUEVO: Forzamos a Node.js a usar el DNS de Google para saltar el bloqueo local
dns.setServers(['8.8.8.8', '8.8.4.4']);

import habitacionRoutes from "./routes/habitacionRoutes.js";
import registroRoutes from "./routes/registroRoutes.js";



dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/habitaciones", habitacionRoutes);
app.use("/api/registros", registroRoutes);

const MONGODB_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("El servidor del Motel Martinny está funcionando correctamente");
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("✅ ¡Conexión a la base de datos MongoDB exitosa!");

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo con éxito en el puerto: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ Error al conectar a MongoDB:", error);
  });