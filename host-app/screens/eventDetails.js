import { navigateTo, socket } from "../app.js";

export default function renderEventDetails(data = {}) {
  socket.on("change-status", (data) => {
    renderEventDetails(data);
  });

  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="event-details-container">
            <button class="back-button" onclick="history.back()"></button>
            <div class="event-card ${getStatusClass(data.event.status)}">
                <div class="event-card-header">
                    <h2>${data.event.eventName}</h2>
                    <p class="event-time">Hoy ${formatTime(
                      data.event.eventStartDate
                    )} - ${formatTime(data.event.eventEndDate)}</p>
                    <p class="event-location">${data.event.eventLocation}</p>
                </div>
                
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${getProgressWidth(
                      data.event.status
                    )}%"></div>
                </div>
                
                <div class="status-content" id="status-message">
                    ${getStatusContent(data.event.status)}
                </div>
                
                ${getStatusActions(data.event.status)}
            </div>
        </div>
    `;

  // Agregar event listeners específicos según el estado
  addStatusEventListeners(data.event.status);
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
                <h3>¡Espera un poco más, estamos analizando! <span class="loading-animation"></span></h3>
                <p>Nuestro equipo está procesando las muestras recolectadas. Los resultados estarán listos muy pronto.</p>
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
    default:
      return `<button class="action-button" onclick="refreshStatus()">Actualizar estado</button>`;
  }
}

function addStatusEventListeners(status) {
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

  window.submitComments = () => {
    const comments = document.getElementById("additional-comments")?.value;
    if (comments && comments.trim()) {
      alert("Comentarios enviados: " + comments);
      document.getElementById("additional-comments").value = "";
    } else {
      alert("Por favor ingresa un comentario antes de enviar.");
    }
  };

  window.refreshStatus = () => {
    location.reload();
  };
}
