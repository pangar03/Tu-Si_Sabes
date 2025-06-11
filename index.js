require("dotenv").config(); // Cargar variables de entorno

const express = require("express");
const path = require("path");
const { createServer } = require("http");
const cors = require("cors");

const { initSocketInstance } = require("./server/services/socket.service");
const usersRouter = require("./server/routes/users.router");
const eventRouter = require("./server/routes/events.router");
const substanceRouter = require("./server/routes/substances.router");

const PORT = process.env.PORT || 5050;

const app = express();
const httpServer = createServer(app);

// MiddleWares
app.use(express.json());
app.use(cors()); // Habilitar CORS para las solicitudes del frontend

// Servir archivos estáticos
app.use("/host-app", express.static(path.join(__dirname, "host-app")));
app.use(
  "/organization-app",
  express.static(path.join(__dirname, "organization-app"))
);
app.use(
  "/report-access",
  express.static(path.join(__dirname, "report-access"))
);

// Ruta raíz para redirigir a la aplicación de acceso a informes
app.get("/", (req, res) => {
  res.redirect("/report-access");
});

// Rutas API
app.use("/", usersRouter);
app.use("/", eventRouter);
app.use("/", substanceRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Services
initSocketInstance(httpServer);

httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
