import { navigateTo } from "../app.js";

export default function renderHomeScreen(data = {}) {

  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="home-container">
      <div class="logo-container">
        <img src="assets/logoechele.svg" alt="Logo" class="logo" onerror="this.src='/api/placeholder/150/150'; this.onerror=null;">
      </div>
      <h1>TÚ-sí sabes</h1>
      
      <div class="role-buttons">
        <button id="fiestero-btn" class="role-btn">Fiestero</button>
        <button id="organizador-btn" class="role-btn">Organizador</button>
      </div>
      
      <div class="report-access-link">
        <a href="#" id="search-report-link">Buscar un reporte por ID</a>
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
