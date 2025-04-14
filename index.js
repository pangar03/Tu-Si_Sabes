const express = require("express");
const path = require("path");
const { createServer } = require("http");

const { initSocketInstance } = require("./server/services/socket.service");
// IMPORTAR LOS ROUTERS AQUI

const PORT = 5050;

const app = express();
const httpServer = createServer(app);

// MiddleWares
app.use(express.json());
// COLOCAR LOS MIDDLEWARES DE LAS APPS

// Rutas (COLOCAR AQUI LOS ROUTERS)
// app.user("/", myRouter);

// Services
initSocketInstance(httpServer);

httpServer.listen(PORT, () =>
    console.log(`Server running at http://localhost:${PORT}`)
);

