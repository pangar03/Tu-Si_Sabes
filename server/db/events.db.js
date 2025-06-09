const { supabase } = require("../config/supabase");

const getEvents = async (userId = null, isOrg = false) => {
  try {
    let query = supabase
      .from("events")
      .select(
        `
                *,
                users!events_user_id_fkey (
                    id,
                    username,
                    is_org
                ),
                event_substances (
                    id,
                    substance_data,
                    created_at
                )
            `
      )
      .order("created_at", { ascending: false });

    // Si no es organización, filtrar solo eventos del usuario
    if (!isOrg && userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching events:", error);
      return [];
    }

    // Transformar datos para mantener compatibilidad con el frontend
    const transformedEvents = data.map((event) => {
      const { event_data, users, ...eventFields } = event;

      return {
        id: eventFields.id, // ID real de la base de datos
        userId: eventFields.user_id, // ID del usuario propietario
        userInfo: users, // Información del usuario propietario
        status: eventFields.status, // Estado actual del evento
        createdAt: new Date(eventFields.created_at).toLocaleString("es-CO", {
          timeZone: "America/Bogota",
        }),
        substances: eventFields.event_substances.map(
          (sub) => sub.substance_data
        ),
        // Agregar datos del evento pero preservando el ID y estado correctos
        ...event_data,
        // Asegurar que el ID y estado reales no sean sobrescritos
        id: eventFields.id,
        userId: eventFields.user_id,
        status: eventFields.status,
        // Mantener el reportId como un campo separado si existe en event_data
        reportId: event_data?.id || event_data?.eventId,
      };
    });

    return transformedEvents;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
};

const addEvent = async (event, userId) => {
  try {
    // Verificar que el usuario existe
    if (!userId) {
      return {
        code: 400,
        message: "ID de usuario requerido para crear evento",
      };
    }

    // Separar las sustancias del evento principal
    const { substances, ...eventData } = event;

    // Asegurar que el estado en event_data coincida con el estado principal
    eventData.status = eventData.status || "pending";

    const { data, error } = await supabase
      .from("events")
      .insert([
        {
          user_id: userId,
          status: eventData.status,
          event_data: eventData,
        },
      ])
      .select(
        `
        *,
        users!events_user_id_fkey (
          id,
          username,
          is_org
        )
      `
      )
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
      id: data.id, // ID real de la base de datos
      userId: data.user_id, // ID del usuario propietario
      userInfo: data.users, // Información del usuario propietario
      status: data.status,
      createdAt: new Date(data.created_at).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      }),
      substances: [],
      // Agregar datos del evento pero preservando el ID y estado correctos
      ...data.event_data,
      // Asegurar que el ID y estado reales no sean sobrescritos
      id: data.id,
      userId: data.user_id,
      status: data.status,
      // Mantener el reportId como un campo separado si existe
      reportId: data.event_data?.id || data.event_data?.eventId,
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

const getEventById = async (id, userId = null, isOrg = false) => {
  try {
    let query = supabase
      .from("events")
      .select(
        `
                *,
                users!events_user_id_fkey (
                    id,
                    username,
                    is_org
                ),
                event_substances (
                    id,
                    substance_data,
                    created_at
                )
            `
      )
      .eq("id", id);

    // Si no es organización, verificar que el evento pertenezca al usuario
    if (!isOrg && userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found
        return {
          code: 404,
          message: "Evento no encontrado o no tienes acceso",
        };
      }
      console.error("Error fetching event:", error);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Transformar datos para mantener compatibilidad
    const { event_data, users, ...eventFields } = data;

    const transformedEvent = {
      id: eventFields.id, // ID real de la base de datos
      userId: eventFields.user_id, // ID del usuario propietario
      userInfo: users, // Información del usuario propietario
      status: eventFields.status, // Estado actual del evento
      createdAt: new Date(eventFields.created_at).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      }),
      substances: eventFields.event_substances.map((sub) => sub.substance_data),
      // Agregar datos del evento pero preservando el ID y estado correctos
      ...event_data,
      // Asegurar que el ID y estado reales no sean sobrescritos
      id: eventFields.id,
      userId: eventFields.user_id,
      status: eventFields.status,
      // Mantener el reportId como un campo separado si existe
      reportId: event_data?.id || event_data?.eventId,
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

const changeStatus = async (id, status, userId = null, isOrg = false) => {
  try {
    // Primero verificar acceso al evento
    const eventCheck = await getEventById(id, userId, isOrg);
    if (eventCheck.code !== 200) {
      return eventCheck;
    }

    // Obtener el evento ORIGINAL directamente de la base de datos
    const { data: originalEvent, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError) {
      console.error("Error fetching original event:", fetchError);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Actualizar el status dentro de event_data preservando todos los demás datos
    const updatedEventData = {
      ...originalEvent.event_data, // Mantener todos los datos originales
      status: status, // Solo actualizar el status
    };

    // Actualizar tanto el estado principal como el estado en event_data
    const { data, error } = await supabase
      .from("events")
      .update({
        status: status,
        event_data: updatedEventData,
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating status:", error);
      return {
        code: 500,
        message: "Error interno del servidor",
      };
    }

    // Obtener el evento completo con sustancias usando la función existente
    const eventWithSubstances = await getEventById(id, userId, isOrg);

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

const addSubstance = async (id, substance, userId = null, isOrg = false) => {
  try {
    // Verificar acceso al evento
    const eventCheck = await getEventById(id, userId, isOrg);
    if (eventCheck.code !== 200) {
      return eventCheck;
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
    const eventWithSubstances = await getEventById(id, userId, isOrg);

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
