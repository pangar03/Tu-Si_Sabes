import { makeRequest, navigateTo } from "../app.js";

export default function renderSearchReport(data = {}) {
  const app = document.getElementById("app");

  // Si hay un reportId en los datos, intentar buscar automáticamente
  const initialReportId = data.reportId || "";

  app.innerHTML = `
        <div class="search-container">

<img src="/report-access/assets/bolitarosa.svg" alt="Bolita Rosa" class="search-bolita search-bolita-rosa">
<img src="/report-access/assets/bolitanegra.svg" alt="Bolita Negra" class="search-bolita search-bolita-negra">
<img src="/report-access/assets/espiral.svg" alt="Espiral" class="search-espiral">

      <div class="logo-container">
      <img src="/report-access/assets/logoechele.svg" alt="Logo" class="logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxNCI+TG9nbzwvdGV4dD4KPC9zdmc+'; this.onerror=null;">      </div>


            <h2>Acceso a Informes de Análisis</h2>
            <form id="search-form" class="search-form">
                <div class="form-group">
                    <label for="report-id">ID del Informe:</label>
                    <input type="text" id="report-id" name="report-id" placeholder="Ingrese el ID del informe" value="${initialReportId}" required>
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Buscar Informe</button>
                </div>
                <p id="search-message" class="message ${
                  data.messageType || ""
                }">
                    ${data.message || ""}
                </p>
            </form>
            <div class="nav-buttons">
                <button id="back-btn" class="btn btn-secondary">Volver al inicio</button>
            </div>
        </div>
    `;

  // Agregar botón para volver a la pantalla de inicio
  document.getElementById("back-btn").addEventListener("click", function () {
    navigateTo("/");
  });

  // Manejar el envío del formulario
  document
    .getElementById("search-form")
    .addEventListener("submit", async function (e) {
      e.preventDefault();

      const reportId = document.getElementById("report-id").value.trim();

      if (!reportId) {
        document.getElementById("search-message").textContent =
          "Por favor, ingrese un ID de informe válido";
        document.getElementById("search-message").className = "message error";
        return;
      }

      try {
        const response = await makeRequest(`/event/${reportId}`, "GET");

        if (response.code && response.code !== 200) {
          // Mostrar mensaje de error
          document.getElementById("search-message").textContent =
            response.message || "No se encontró el informe solicitado";
          document.getElementById("search-message").className = "message error";
        } else {
          // Navegar a la vista del informe
          navigateTo("/report-view", { event: response });
        }
      } catch (error) {
        document.getElementById("search-message").textContent =
          "Error al conectar con el servidor";
        document.getElementById("search-message").className = "message error";
      }
    });

  // Si hay un ID de reporte inicial, realizar la búsqueda automáticamente
  if (initialReportId) {
    document.getElementById("search-form").dispatchEvent(new Event("submit"));
  }
}
