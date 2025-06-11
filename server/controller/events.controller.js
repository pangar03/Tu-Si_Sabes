const {
  getEvents,
  addEvent,
  getEventById,
  changeStatus,
  addSubstance,
} = require("../db/events.db");
const { emitEvent } = require("../services/socket.service");

const getEventsController = async (req, res) => {
  // Obtener información del usuario de los query parameters o headers
  const userId = req.query.userId || req.headers["user-id"];
  const isOrg = req.query.isOrg === "true" || req.headers["is-org"] === "true";

  const response = await getEvents(userId, isOrg);
  res.send(response);
};

const addEventController = async (req, res) => {
  const event = req.body;

  // Obtener userId del body, query params o headers
  const userId = event.userId || req.query.userId || req.headers["user-id"];

  if (!userId) {
    return res.send({
      code: 400,
      message: "ID de usuario requerido para crear evento",
    });
  }

  // Limpiar el userId del body del evento para evitar duplicados
  delete event.userId;

  event.id = Date.now();
  event.createdAt = new Date(event.id).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
  });
  event.status = "pending";
  event.substances = [];

  const response = await addEvent(event, userId);

  if (response.code === 200) {
    emitEvent("new-event", response.event);
  }

  return res.send(response);
};

const getEventByIdController = async (req, res) => {
  const id = req.params.id;
  const userId = req.query.userId || req.headers["user-id"];
  const isOrg = req.query.isOrg === "true" || req.headers["is-org"] === "true";

  const response = await getEventById(id, userId, isOrg);

  if (response.code !== 200) {
    return res.send(response.message);
  } else {
    return res.send(response.event);
  }
};

const changeStatusController = async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;
  const userId = req.query.userId || req.headers["user-id"];
  const isOrg = req.query.isOrg === "true" || req.headers["is-org"] === "true";

  console.log(
    `Attempting to change status for event ID: ${id} to status: ${status}`
  );

  const response = await changeStatus(id, status, userId, isOrg);

  console.log("Response from changeStatus:", response);

  // Verificar que la respuesta y el evento existan antes de emitir
  if (response.code === 200 && response.event) {
    console.log("Emitting change-status event with:", response.event);
    emitEvent("change-status", response);
  } else {
    console.error("Error in changeStatusController:", response);
  }

  return res.send(response);
};

const addSubstanceController = async (req, res) => {
  const id = req.params.id;
  const substance = req.body;
  const userId = req.query.userId || req.headers["user-id"];
  const isOrg = req.query.isOrg === "true" || req.headers["is-org"] === "true";

  console.log(`Attempting to add substance to event ID: ${id}`);

  const response = await addSubstance(id, substance, userId, isOrg);

  console.log("Response from addSubstance:", response);

  // Verificar que la respuesta y el evento existan antes de emitir
  if (response.code === 200 && response.event) {
    console.log("Emitting add-substance event with:", response.event);
    emitEvent("add-substance", response);
  } else {
    console.error("Error in addSubstanceController:", response);
  }

  return res.send(response);
};

module.exports = {
  getEventsController,
  addEventController,
  getEventByIdController,
  changeStatusController,
  addSubstanceController,
};
