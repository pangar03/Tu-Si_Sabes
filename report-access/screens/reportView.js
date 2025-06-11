import { makeRequest, navigateTo, socket } from "../app.js";

export default async function renderReportView(data = {}) {
  if (!data.event) {
    navigateTo("/search-report", {
      message: "No se ha especificado ningún informe para visualizar",
      messageType: "error",
    });
    return;
  }

  const currentEventId = data.event.id;

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="report-container">
      <div id="event-details-header">
        <h2>${data.event.eventName}</h2>
        <p>🕒 ${data.event.eventStartDate} - ${data.event.eventEndDate}</p>
        <p>📍 ${data.event.eventLocation}</p>
        <h4>ID del informe: ${data.event.id}</h4>
        <p>Estado: <span id="event-status">${data.event.status}</span></p>
      </div>
      <ul id="substance-list">
        <p>Cargando resultados...</p>
      </ul>
      <div class="nav-buttons">
        <button id="back-btn" class="btn btn-secondary">Volver a la búsqueda</button>
        <button id="home-btn" class="btn btn-secondary">Ir al inicio</button>
      </div>
    </div>
  `;

  document.getElementById("back-btn").addEventListener("click", function () {
    navigateTo("/search-report");
  });

  document.getElementById("home-btn").addEventListener("click", function () {
    navigateTo("/");
  });

  const loadSubstances = async (eventData) => {
    const substanceList = document.getElementById("substance-list");
    document.getElementById("event-status").textContent = eventData.status;

    if (
      !eventData.substances ||
      eventData.substances.length === 0 ||
      (eventData.status !== "results" && eventData.status !== "completed")
    ) {
      substanceList.innerHTML = `
        <div class="message info">
          <p>No hay resultados disponibles para este informe o el análisis aún está en proceso.</p>
          <p>Estado actual del evento: ${eventData.status}</p>
        </div>
      `;
      return;
    }

    substanceList.innerHTML = "";

    for (const substance of eventData.substances) {
      let substanceData;
      let adulterantData;

      try {
        const substanceResponse = await makeRequest(
          `/substances?id=${substance.primary_substance}`,
          "GET"
        );
        substanceData = substanceResponse.substance
          ? substanceResponse.substance
          : null;

        if (substance.adulterant_presence) {
          const adulterantResponse = await makeRequest(
            `/adulterants?id=${substance.adulterant}`,
            "GET"
          );
          adulterantData = adulterantResponse.adulterant
            ? adulterantResponse.adulterant
            : null;
        }
      } catch (error) {
        console.error("Error al obtener datos de sustancia:", error);
      }

      const substanceCard = document.createElement("li");
      substanceCard.classList.add("substance-card");

      if (substanceData) {
        substanceCard.innerHTML = `
          <div class="substance-card-header">
            <h3>${substance.primary_substance.toUpperCase()}</h3>
            <p>ID del análisis: ${substance.id}</p>
            <p class="sub-detected">Detectado en laboratorio: <strong>[${
              substance.primary_substance
            }${
          substance.adulterant_presence ? " + " + substance.adulterant : ""
        }]</strong></p>
            ${
              eventData.status === "completed"
                ? '<div class="status-badge completed">Análisis Completado</div>'
                : ""
            }
          </div>
          <div class="substance-highlights"></div>

          <div class="substance-badges" ${substanceData?.es_peligroso || adulterantData?.es_peligroso ? 'style="display: none"' : ""}>
            <div class="badge">
              <p class="badge-title">Duración</p>
              <p class="badge-value">${substanceData?.duracion.duracion_total_horas ? substanceData?.duracion.duracion_total_horas : "N/A"} horas</p>
            </div>
            <div class="badge">
              <p class="badge-title">Dosis máx</p>
              <p class="badge-value">${substanceData?.dosis_maxima ? substanceData.dosis_maxima : "NA"}</p>
            </div>
            <div class="badge">
              <p class="badge-title">Redosificación</p>
              <p class="badge-value">${substanceData.se_puede_redosificar ? `✅` : `🚫`}</p>
            </div>
          </div>

          <ul class="substance-risks">
            <h4>Riesgos</h4>
            ${
              substanceData?.riesgos
                ? substanceData.riesgos
                    .map((risk) => `<li>${risk}</li>`)
                    .join("")
                : ""
            }
            ${
              adulterantData?.riesgos
                ? adulterantData.riesgos
                    .map((risk) => `<li>${risk}</li>`)
                    .join("")
                : ""
            }
          </ul>

          <ul class="substance-recomendations">
            <h4>Recomendaciones</h4>
            ${
              substanceData?.recomendaciones
                ? substanceData.recomendaciones
                    .map((recomendation) => `<li>${recomendation}</li>`)
                    .join("")
                : ""
            }
            ${
              adulterantData?.recomendaciones
                ? adulterantData.recomendaciones
                    .map((recomendation) => `<li>${recomendation}</li>`)
                    .join("")
                : ""
            }
          </ul>

          <div class="substance-considerations">
            <h4>Consideraciones</h4>
            <p>${
              substance.considerations ||
              "No se han proporcionado consideraciones adicionales"
            }</p>
          </div>
        `;

        const substanceHighlights = substanceCard.querySelector(
          ".substance-highlights"
        );
        if (
          (substanceData.hasOwnProperty("es_peligroso") &&
            substanceData.es_peligroso) ||
          (adulterantData && adulterantData.es_peligroso)
        ) {
          substanceHighlights.innerHTML = `<h4>Se recomienda evitar totalmente el consumo de esta sustancia</h4>`;
        }
      } else {
        substanceCard.innerHTML = `
          <div class="substance-card-header">
            <h3>Sustancia llevada como ${substance.reported_substance}</h3>
            <p>ID del análisis: ${substance.id}</p>
            <p>Resultados preliminares: ${
              substance.primary_substance +
              (substance.adulterant_presence
                ? " + " + substance.adulterant
                : "")
            }</p>
            ${
              eventData.status === "completed"
                ? '<div class="status-badge completed">Análisis Completado</div>'
                : ""
            }
          </div>
          <div class="substance-considerations">
            <h4>Consideraciones</h4>
            <p style="color:rgb(255, 0, 102)">${
              substance.considerations ||
              "No se han proporcionado consideraciones adicionales"
            }</p>
          </div>
        `;
      }

      substanceList.appendChild(substanceCard);
    }
  };

  const setupSocketListeners = () => {
    socket.on("add-substance", (response) => {
      if (response.event && response.event.id === currentEventId) {
        console.log(
          "Actualización en tiempo real: Nueva sustancia añadida al evento",
          response.event.id
        );
        loadSubstances(response.event);
      }
    });

    socket.on("change-status", (response) => {
      if (response.event && response.event.id === currentEventId) {
        console.log(
          "Actualización en tiempo real: Estado del evento actualizado",
          response.event.id
        );
        loadSubstances(response.event);
      }
    });
  };

  await loadSubstances(data.event);
  setupSocketListeners();
}
