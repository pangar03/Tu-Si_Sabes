const events = [];

const getEvents = async () => {
    return events;
};

const addEvent = async (event) => {
    events.push(event);
    return { code: 200, message: "Evento añadido con éxito", event };
};

const getEventById = async (id) => {
    const event = events.find((event) => event.id === Number(id));
    if (!event) {
        return { code: 404, message: "Evento no encontrado" };
    }
    return { code: 200, event, message: "Evento encontrado exitosamente" };
};

const changeStatus = async (id, status) => {
    const event = events.find((event) => event.id === Number(id));
    if (!event) {
        return { code: 404, message: "Evento no encontrado" };
    }
    event.status = status;
    return { code: 200, message: `Estado del evento actualizado a ${status} correctamente`, event };
};

module.exports = {
    getEvents,
    addEvent,
    getEventById,
    changeStatus,
};