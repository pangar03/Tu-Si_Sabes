const { supabase } = require("../config/supabase");

const getEvents = async () => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
                *,
                event_substances (
                    id,
                    substance_data,
                    created_at
                )
            `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    // Transformar datos para mantener compatibilidad con el frontend
    const transformedEvents = data.map((event) => ({
      id: event.id,
      status: event.status,
      createdAt: new Date(event.created_at).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      }),
      substances: event.event_substances.map((sub) => sub.substance_data),
      ...event.event_data, // Agregar cualquier dato adicional del evento
    }));

    return transformedEvents;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
};

const addEvent = async (event) => {
  try {
    // Separar las sustancias del evento principal
    const { substances, ...eventData } = event;

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          status: eventData.status || "pending",
          event_data: eventData,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding event:", error);
      return {
        code: 500,
        message: "Error interno del servidor al crear evento",
      };
    }

    // Transformar para mantener compatibilidad
    const transformedEvent = {
      id: data.id,
      status: data.status,
      createdAt: new Date(data.created_at).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      }),
      substances: [],
      ...data.event_data,
    };

    return {
      code: 200,
      message: "Evento añadido con éxito",
      event: transformedEvent,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      code: 500,
      message: "Error interno del servidor",
    };
  }
};

const getEventById = async (id) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .select(
        `
                *,
                event_substances (
                    id,
                    substance_data,
                    created_at
                )
            `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return { code: 404, message: "Evento no encontrado" };
      }
      console.error("Error fetching event:", error);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Transformar datos para mantener compatibilidad
    const transformedEvent = {
      id: data.id,
      status: data.status,
      createdAt: new Date(data.created_at).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      }),
      substances: data.event_substances.map((sub) => sub.substance_data),
      ...data.event_data,
    };

    return {
      code: 200,
      event: transformedEvent,
      message: "Evento encontrado exitosamente",
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      code: 500,
      message: "Error interno del servidor",
    };
  }
};

const changeStatus = async (id, status) => {
  try {
    const { data, error } = await supabase
      .from("events")
      .update({ status })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return { code: 404, message: "Evento no encontrado" };
      }
      console.error("Error updating status:", error);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Obtener el evento completo con sustancias
    const eventWithSubstances = await getEventById(id);

    return {
      code: 200,
      message: `Estado del evento actualizado a ${status} correctamente`,
      event: eventWithSubstances.event,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      code: 500,
      message: "Error interno del servidor",
    };
  }
};

const addSubstance = async (id, substance) => {
  try {
    // Verificar que el evento existe
    const { data: eventExists, error: checkError } = await supabase
      .from("events")
      .select("id")
      .eq("id", id)
      .single();

    if (checkError) {
      if (checkError.code === "PGRST116") {
        return { code: 404, message: "Evento no encontrado" };
      }
      console.error("Error checking event:", checkError);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Agregar la sustancia
    const { data, error } = await supabase
      .from("event_substances")
      .insert([
        {
          event_id: id,
          substance_data: substance,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error adding substance:", error);
      return {
        code: 500,
        message: "Error interno del servidor al agregar sustancia",
      };
    }

    // Obtener el evento completo actualizado
    const eventWithSubstances = await getEventById(id);

    return {
      code: 200,
      message: "Sustancia añadida correctamente",
      event: eventWithSubstances.event,
    };
  } catch (error) {
    console.error("Database error:", error);
    return {
      code: 500,
      message: "Error interno del servidor",
    };
  }
};

module.exports = {
  getEvents,
  addEvent,
  getEventById,
  changeStatus,
  addSubstance,
};
