const {
  getEvents,
  addEvent,
  getEventById,
  changeStatus,
  addSubstance,
} = require("../db/events.db");
const { emitEvent } = require("../services/socket.service");

const getEventsController = async (req, res) => {
  const response = await getEvents();
  res.send(response);
};

const addEventController = async (req, res) => {
  const event = req.body;
  event.id = Date.now();
  event.createdAt = new Date(event.id).toLocaleString("es-CO", {
    timeZone: "America/Bogota",
  });
  event.status = "pending";
  event.substances = [];
  const response = await addEvent(event);

  emitEvent("new-event", response.event);
  return res.send(response);
};

const getEventByIdController = async (req, res) => {
  const id = req.params.id;
  const response = await getEventById(id);

  if (response.code !== 200) {
    return res.send(response.message);
  } else {
    return res.send(response.event);
  }
};

const changeStatusController = async (req, res) => {
  const id = req.params.id;
  const status = req.body.status;

  console.log(
    `Attempting to change status for event ID: ${id} to status: ${status}`
  );

  const response = await changeStatus(id, status);

  console.log("Response from changeStatus:", response);

  // CAMBIO: Verificar que la respuesta y el evento existan antes de emitir
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

  console.log(`Attempting to add substance to event ID: ${id}`);

  const response = await addSubstance(id, substance);

  console.log("Response from addSubstance:", response);

  // CAMBIO: Verificar que la respuesta y el evento existan antes de emitir
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
