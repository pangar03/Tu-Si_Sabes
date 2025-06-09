import { navigateTo, socket, makeRequest } from "../app.js";

export default async function renderEventDetails(data = {}) {
  let eventData = data.event;

  // Si no tenemos el evento completo pero tenemos el ID, cargarlo
  if (!eventData && data.eventId && data.user) {
    try {
      eventData = await makeRequest(
        `/event/${data.eventId}?userId=${data.user.id}&isOrg=false`,
        "GET"
      );
    } catch (error) {
      console.error("Error loading event:", error);
      const app = document.getElementById("app");
      app.innerHTML = `
        <div class="error-container">
          <h2>Error al cargar el evento</h2>
          <p>No se pudo cargar la información del evento. Intenta nuevamente.</p>
          <button onclick="history.back()" class="btn btn-primary">←</button>
        </div>
      `;
      return;
    }
  }

  // Verificar que tenemos los datos del evento
  if (!eventData) {
    const app = document.getElementById("app");
    app.innerHTML = `
      <div class="error-container">
        <h2>Evento no encontrado</h2>
        <p>No se encontró la información del evento solicitado.</p>
        <button onclick="history.back()" class="btn btn-primary">←</button>
      </div>
    `;
    return;
  }

  // Configurar socket para actualizaciones en tiempo real
  socket.on("change-status", (response) => {
    if (response.event && response.event.id === eventData.id) {
      renderEventDetails({ user: data.user, event: response.event });
    }
  });

  socket.on("add-substance", (response) => {
    if (response.event && response.event.id === eventData.id) {
      renderEventDetails({ user: data.user, event: response.event });
    }
  });

  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="event-details-container">
            <button class="back-button" onclick="history.back()">←</button>
            <div class="event-card ${getStatusClass(eventData.status)}">
                <div class="event-card-header">
                    <h2>${eventData.eventName}</h2>
                    <p class="event-time">${formatDate(
                      eventData.eventStartDate
                    )} ${formatTime(eventData.eventStartDate)} - ${formatTime(
    eventData.eventEndDate
  )}</p>
                    <p class="event-location">${eventData.eventLocation}</p>
                    <p class="event-created">Creado: ${eventData.createdAt}</p>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${getProgressWidth(
                      eventData.status
                    )}%"></div>
                </div>
                
                <div class="status-content" id="status-message">
                    ${getStatusContent(eventData.status)}
                </div>
                
                ${getStatusActions(eventData.status, eventData.id)}
            </div>
        </div>
    `;

  // Agregar event listeners solo para las funciones necesarias
  addStatusEventListeners(eventData.status, eventData.id, data.user);
}

function getStatusClass(status) {
  const statusClasses = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    "on-transit": "status-on-transit",
    "on-site": "status-on-site",
    analyzing: "status-analyzing",
    analizing: "status-analyzing", // Mantener compatibilidad
    results: "status-results",
    completed: "status-completed",
  };
  return statusClasses[status] || "";
}

function getProgressWidth(status) {
  const progressMap = {
    pending: 20,
    confirmed: 40,
    "on-transit": 60,
    "on-site": 80,
    analyzing: 90,
    analizing: 90, // Mantener compatibilidad
    results: 100,
    completed: 100,
  };
  return progressMap[status] || 0;
}

function formatTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-CO");
}

function getStatusContent(status) {
  switch (status) {
    case "pending":
      return `
        <h3>Tu solicitud está siendo revisada</h3>
        <p>Estamos verificando la disponibilidad para tu evento. Te notificaremos pronto sobre la confirmación.</p>
      `;
    case "confirmed":
      return `
        <h3>¡Échele Cabeza ha confirmado su asistencia!</h3>
        <p>Ten paciencia, siempre llegamos a tiempo. Ya hemos confirmado nuestra asistencia y estaremos pronto dándola toda.</p>
      `;
    case "on-transit":
      return `
        <h3>¡Échele Cabeza está en camino!</h3>
        <p>Ten paciencia, siempre llegamos a tiempo. Ya estamos en ruta hacia tu evento y llegaremos puntualmente.</p>
      `;
    case "on-site":
      return `
        <h3>¡Llegamos!</h3>
        <p>Abre la puerta, nuestro equipo está listo para apoyar tu evento de la mejor manera.</p>
      `;
    case "analyzing":
    case "analizing": // Mantener compatibilidad
      return `
        <h3>¡Espera un poco más, estamos analizando! <span class="loading-animation"></span></h3>
        <p>Nuestro equipo está procesando las muestras recolectadas. Los resultados estarán listos muy pronto.</p>
      `;
    case "results":
      return `
        <h3>¡Resultados listos! ✅</h3>
        <p>Los análisis han sido completados. Revisa los resultados de las sustancias analizadas.</p>
      `;
    case "completed":
      return `
        <h3>¡Evento completado! 🎉</h3>
        <p>El evento ha sido finalizado exitosamente. Todos los resultados están disponibles para su consulta.</p>
      `;
    default:
      return `
        <h3>Estado desconocido</h3>
        <p>Por favor, contacta con soporte para más información.</p>
      `;
  }
}

function getStatusActions(status, eventId) {
  switch (status) {
    case "results":
      return `<button class="action-button" onclick="viewReport()">Ver reporte de resultados</button>`;
    case "completed":
      return `<button class="action-button" onclick="viewReport()">Ver reporte completo</button>`;
    default:
      return ""; // No mostrar botones para otros estados
  }
}

function addStatusEventListeners(status, eventId, user) {
  // Solo agregar el event listener para ver el reporte cuando sea necesario
  if (status === "results" || status === "completed") {
    window.viewReport = async () => {
      try {
        // Obtener los datos completos del evento antes de navegar
        const eventData = await makeRequest(
          `/event/${eventId}?userId=${user.id}&isOrg=false`,
          "GET"
        );

        // Guardar los datos del evento en sessionStorage para que report-access los pueda usar
        sessionStorage.setItem("reportEventData", JSON.stringify(eventData));

        // Navegar a report-access con parámetros que indiquen que debe mostrar el reporte
        window.location.href = `/report-access?action=viewReport&eventId=${eventId}`;
      } catch (error) {
        console.error("Error al cargar el evento para el reporte:", error);
        // Si falla la carga, navegar solo con el ID del evento
        window.location.href = `/report-access?action=viewReport&eventId=${eventId}`;
      }
    };
  }
}
