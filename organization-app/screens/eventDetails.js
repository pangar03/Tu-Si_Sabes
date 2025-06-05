import { makeRequest, navigateTo, socket } from "../app.js";

export default function renderEventDetails(data = {}) {
  socket.on("change-status", (res) => {
    renderEventDetails({ ...data, event: res.event });
  });

  const app = document.getElementById("app");
  app.innerHTML = `
        <div id="event-details-header">
            <h2>${data.event.eventName}</h2>
            <p>Inicio: ${data.event.eventStartDate}</p>    
            <p>Fin: ${data.event.eventEndDate}</p>    
            <h4>${data.event.eventLocation}</h4>
        </div>
        <div id="event-details-body">
            <h3>Detalles del evento</h3>
            <p>${data.event.eventDescription}</p>
            ${
              data.event.substances && data.event.substances.length > 0
                ? `<div id="substances-summary">
                <h4>Sustancias registradas: ${data.event.substances.length}</h4>
                <p>Se han registrado sustancias para este evento.</p>
              </div>`
                : ""
            }    
        </div>
        <div id="event-details-buttons"></div>
    `;

  switch (data.event.status) {
    case "pending":
      pendingStatus(data);
      break;
    case "confirmed":
      confirmedStatus(data);
      break;
    case "on-transit":
      confirmedStatus(data);
      break;
    case "on-site":
      onSiteStatus(data);
      break;
    case "analizing":
      analyzingStatus(data);
      break;
    case "results":
      resultsStatus(data);
      break;
    default:
      break;
  }
}

async function pendingStatus(data) {
  const container = document.getElementById("event-details-buttons");
  container.innerHTML = `
        <button class="btn btn-primary" id="confirm-event">Confirmar Evento</button>
    `;

  document
    .getElementById("confirm-event")
    .addEventListener("click", async () => {
      const response = await makeRequest(
        `/event/${data.event.id}/change-status`,
        "POST",
        {
          status: "confirmed",
        }
      );
      console.log("Response from confirm event:", response);
    });
}

async function confirmedStatus(data) {
  const container = document.getElementById("event-details-buttons");
  container.innerHTML = `
        <button class="btn btn-primary" id="on-transit-event">Ir al lugar</button>
        <button class="btn btn-primary" id="on-site-event">Anunciar llegada</button>
    `;

  document
    .getElementById("on-transit-event")
    .addEventListener("click", async () => {
      const response = await makeRequest(
        `/event/${data.event.id}/change-status`,
        "POST",
        {
          status: "on-transit",
        }
      );
      alert("Anunciando salida hacia el lugar del evento");
      console.log("Response from on-transit:", response);
    });

  document
    .getElementById("on-site-event")
    .addEventListener("click", async () => {
      const response = await makeRequest(
        `/event/${data.event.id}/change-status`,
        "POST",
        {
          status: "on-site",
        }
      );
      alert("Anunciando llegada al lugar del evento");
      console.log("Response from on-site:", response);
    });
}

async function onSiteStatus(data) {
  const container = document.getElementById("event-details-buttons");
  container.innerHTML = `
        <button class="btn btn-primary" id="analizing-event">Empezar análisis</button>
    `;

  document
    .getElementById("analizing-event")
    .addEventListener("click", async () => {
      const response = await makeRequest(
        `/event/${data.event.id}/change-status`,
        "POST",
        {
          status: "analizing",
        }
      );
      alert("Empezando análisis de sustancias evento");
      console.log("Response from analizing:", response);
    });
}

// Nueva función para el estado "analizing"
async function analyzingStatus(data) {
  const container = document.getElementById("event-details-buttons");
  container.innerHTML = `
        <button class="btn btn-primary" id="continue-analysis">Continuar con análisis</button>
    `;

  document.getElementById("continue-analysis").addEventListener("click", () => {
    navigateTo("/results-page", data);
  });
}

// Nueva función para el estado "results" - permite seguir agregando sustancias
async function resultsStatus(data) {
  const container = document.getElementById("event-details-buttons");
  container.innerHTML = `
        <button class="btn btn-primary" id="continue-adding-substances">Continuar agregando sustancias</button>
        <button class="btn btn-secondary" id="finish-analysis">Finalizar análisis</button>
    `;

  document
    .getElementById("continue-adding-substances")
    .addEventListener("click", () => {
      navigateTo("/results-page", data);
    });

  document
    .getElementById("finish-analysis")
    .addEventListener("click", async () => {
      const response = await makeRequest(
        `/event/${data.event.id}/change-status`,
        "POST",
        {
          status: "completed",
        }
      );
      if (response.code === 200) {
        alert("Análisis finalizado exitosamente");
        // Opcional: regresar al dashboard
        navigateTo("/dashboard", data);
      } else {
        alert("Error al finalizar el análisis");
      }
      console.log("Response from finish analysis:", response);
    });
}
