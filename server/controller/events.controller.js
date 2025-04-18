const { getEvents, addEvent, getEventById, changeStatus } = require('../db/events.db');
const { emitEvent } = require('../services/socket.service');

const getEventsController = async (req, res) => {
    const response = await getEvents();
    res.send(response);
};

const addEventController = async (req, res) => {
    const event = req.body;
    event.id = Date.now();
    event.createdAt = new Date(event.id).toLocaleString("es-CO", {"timeZone": "America/Bogota"});
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

    const response = await changeStatus(id, status);
    emitEvent("change-status", response);
    return res.send(response);
};

module.exports = {
    getEventsController,
    addEventController,
    getEventByIdController,
    changeStatusController,
}