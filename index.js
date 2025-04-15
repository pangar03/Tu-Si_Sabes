const express = require("express");
const path = require("path");
const { createServer } = require("http");
const cors = require("cors"); // Es recomendable añadir CORS

const { initSocketInstance } = require("./server/services/socket.service");
const usersRouter = require("./server/routes/users.router");

const PORT = 5050;

const app = express();
const httpServer = createServer(app);

// MiddleWares
app.use(express.json());
app.use(cors()); // Habilitar CORS para las solicitudes del frontend

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "app1")));

// Rutas API
app.use("/", usersRouter);

// Services
initSocketInstance(httpServer);

httpServer.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
