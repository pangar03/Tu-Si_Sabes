import { navigateTo } from "../app.js";

export default function renderHomeScreen(data = {}) {

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="home-container">

    <img src="/report-access/assets/bolitarosa.svg" alt="Bolita Rosa" class="bolita bolita-rosa">
    <img src="/report-access/assets/bolitanegra.svg" alt="Bolita Negra" class="bolita bolita-negra">
    <img src="/report-access/assets/espiral.svg" alt="espiral" class="espiral">


      <div class="logo-container">
      <img src="/report-access/assets/logoechele.svg" alt="Logo" class="logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxNCI+TG9nbzwvdGV4dD4KPC9zdmc+'; this.onerror=null;">      </div>
      <div class="logotusi-container">
      <img src="/report-access/assets/logotusi.svg" alt="Logo" class="tusilogo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjZGRkIi8+Cjx0ZXh0IHg9Ijc1IiB5PSI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzk5OSIgZm9udC1zaXplPSIxNCI+TG9nbzwvdGV4dD4KPC9zdmc+'; this.onerror=null;">      </div>

      
      <div class="role-buttons">
        <button id="fiestero-btn" class="role-btn">Fiestero</button>
        <button id="organizador-btn" class="role-btn">Organizador</button>
        <div class="report-access-link">
          <a href="#" id="search-report-link">Buscar un reporte por ID</a>
        </div>
      </div>
      
    </div>
  `;

  // Evento para botón Fiestero
  document
    .getElementById("fiestero-btn")
    .addEventListener("click", function () {
      window.location.href = "/host-app";
    });

  // Evento para botón Organizador
  document
    .getElementById("organizador-btn")
    .addEventListener("click", function () {
      window.location.href = "/organization-app";
    });

  // Evento para ir a la pantalla de búsqueda de reportes
  document
    .getElementById("search-report-link")
    .addEventListener("click", function (e) {
      e.preventDefault();
      navigateTo("/search-report");
    });
}
