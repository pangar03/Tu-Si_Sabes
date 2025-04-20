import { makeRequest, navigateTo } from "../app.js";

export default async function renderReportView(data = {}) {
  if (!data.event) {
    navigateTo("/search-report", {
      message: "No se ha especificado ningún informe para visualizar",
      messageType: "error",
    });
    return;
  }

  const app = document.getElementById("app");
  app.innerHTML = `
        <div class="report-container">
            <div id="event-details-header">
                <h2>${data.event.eventName}</h2>
                <p>Inicio: ${data.event.eventStartDate}</p>    
                <p>Fin: ${data.event.eventEndDate}</p>    
                <p>${data.event.eventLocation}</p>
                <h4>ID del informe: ${data.event.id}</h4>
                <p>Estado: ${data.event.status}</p>
            </div>
            <ul id="substance-list">
                <p>Cargando resultados...</p>
            </ul>
            <div class="nav-buttons">
                <button id="back-btn" class="btn btn-secondary">Volver a la búsqueda</button>
            </div>
        </div>
    `;

  document.getElementById("back-btn").addEventListener("click", function () {
    navigateTo("/search-report");
  });

  // Si no hay sustancias analizadas o el evento no está en estado de resultados
  if (
    !data.event.substances ||
    data.event.substances.length === 0 ||
    data.event.status !== "results"
  ) {
    const substanceList = document.getElementById("substance-list");
    substanceList.innerHTML = `
            <div class="message info">
                <p>No hay resultados disponibles para este informe o el análisis aún está en proceso.</p>
                <p>Estado actual del evento: ${data.event.status}</p>
            </div>
        `;
    return;
  }

  // Cargar y mostrar las sustancias
  const substanceList = document.getElementById("substance-list");
  substanceList.innerHTML = ""; // Limpiar el mensaje de carga

  // Procesar cada sustancia del evento
  for (const substance of data.event.substances) {
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

    // Construir el contenido de la tarjeta de sustancia
    if (substanceData) {
      substanceCard.innerHTML = `
                <div class="substance-card-header">
                    <h3>Sustancia llevada como ${
                      substance.reported_substance
                    }</h3>
                    <p>ID del análisis: ${substance.id}</p>
                    <p>Resultados preliminares: ${
                      substance.primary_substance +
                      (substance.adulterant_presence
                        ? " + " + substance.adulterant
                        : "")
                    }</p>
                </div>
                <div class="substance-highlights"></div>
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
      // Caso cuando no hay datos completos de la sustancia
      substanceCard.innerHTML = `
                <div class="substance-card-header">
                    <h3>Sustancia llevada como ${
                      substance.reported_substance
                    }</h3>
                    <p>ID del análisis: ${substance.id}</p>
                    <p>Resultados preliminares: ${
                      substance.primary_substance +
                      (substance.adulterant_presence
                        ? " + " + substance.adulterant
                        : "")
                    }</p>
                </div>
                <div class="substance-considerations">
                    <h4>Consideraciones</h4>
                    <p>${
                      substance.considerations ||
                      "No se han proporcionado consideraciones adicionales"
                    }</p>
                </div>
            `;
    }

    substanceList.appendChild(substanceCard);
  }
}
