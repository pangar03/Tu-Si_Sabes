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
          <button onclick="history.back()" class="btn btn-primary">Volver</button>
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
        <button onclick="history.back()" class="btn btn-primary">Volver</button>
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
            <button class="back-button" onclick="history.back()">← Volver</button>
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
                
                ${getStatusActions(eventData.status)}
                
                ${
                  eventData.substances && eventData.substances.length > 0
                    ? `<div class="substances-section">
                    <h3>Sustancias Analizadas</h3>
                    <div class="substances-list">
                      ${eventData.substances
                        .map(
                          (substance) => `
                        <div class="substance-item">
                          <h4>${substance.name || "Sustancia desconocida"}</h4>
                          <p><strong>Tipo:</strong> ${
                            substance.type || "No especificado"
                          }</p>
                          <p><strong>Estado:</strong> ${
                            substance.status || "Pendiente"
                          }</p>
                          ${
                            substance.results
                              ? `<p><strong>Resultados:</strong> ${substance.results}</p>`
                              : ""
                          }
                          ${
                            substance.observations
                              ? `<p><strong>Observaciones:</strong> ${substance.observations}</p>`
                              : ""
                          }
                        </div>
                      `
                        )
                        .join("")}
                    </div>
                  </div>`
                    : ""
                }
            </div>
        </div>
    `;

  // Agregar event listeners específicos según el estado
  addStatusEventListeners(eventData.status, eventData.id, data.user);
}

function getStatusClass(status) {
  const statusClasses = {
    pending: "status-pending",
    confirmed: "status-confirmed",
    "on-transit": "status-on-transit",
    "on-site": "status-on-site",
    analyzing: "status-analyzing",
    results: "status-results",
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
    results: 100,
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
      return `
                <h3>¡Espera un poco más, estamos analizando! <span class="loading-animation">⏳</span></h3>
                <p>Nuestro equipo está procesando las muestras recolectadas. Los resultados estarán listos muy pronto.</p>
            `;
    case "results":
      return `
                <h3>¡Resultados listos! ✅</h3>
                <p>Los análisis han sido completados. Revisa los resultados de las sustancias analizadas.</p>
            `;
    default:
      return `
                <h3>Estado desconocido</h3>
                <p>Por favor, contacta con soporte para más información.</p>
            `;
  }
}

function getStatusActions(status) {
  switch (status) {
    case "pending":
      return `<button class="action-button" disabled>Esperando confirmación...</button>`;
    case "confirmed":
      return `<button class="action-button" onclick="showEventDetails()">Ver detalles del evento</button>`;
    case "on-transit":
      return `<button class="action-button" onclick="trackLocation()">Seguir ubicación</button>`;
    case "on-site":
      return `<button class="action-button" onclick="contactTeam()">Contactar equipo</button>`;
    case "analyzing":
      return `
                <textarea class="input-field" placeholder="¿Quieres agregar algún comentario adicional sobre las muestras?" id="additional-comments"></textarea>
                <button class="action-button" onclick="submitComments()">Enviar comentarios</button>
            `;
    case "results":
      return `
                <button class="action-button" onclick="downloadReport()">Descargar reporte</button>
                <button class="action-button secondary" onclick="shareResults()">Compartir resultados</button>
            `;
    default:
      return `<button class="action-button" onclick="refreshStatus()">Actualizar estado</button>`;
  }
}

function addStatusEventListeners(status, eventId, user) {
  // Agregar event listeners globales para las funciones de los botones
  window.showEventDetails = () => {
    alert("Mostrando detalles del evento...");
  };

  window.trackLocation = () => {
    alert("Abriendo rastreador de ubicación...");
  };

  window.contactTeam = () => {
    alert("Conectando con el equipo...");
  };

  window.submitComments = async () => {
    const comments = document.getElementById("additional-comments")?.value;
    if (comments && comments.trim()) {
      try {
        // Aquí podrías enviar los comentarios al servidor
        alert("Comentarios enviados: " + comments);
        document.getElementById("additional-comments").value = "";
      } catch (error) {
        alert("Error al enviar comentarios. Intenta nuevamente.");
      }
    } else {
      alert("Por favor ingresa un comentario antes de enviar.");
    }
  };

  window.downloadReport = () => {
    alert("Descargando reporte...");
  };

  window.shareResults = () => {
    alert("Compartiendo resultados...");
  };

  window.refreshStatus = () => {
    location.reload();
  };
}
