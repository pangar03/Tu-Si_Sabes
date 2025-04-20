import { navigateTo } from "../app.js";

export default function renderHomeScreen(data = {}) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="home-container">
      <div class="logo-container">
        <img src="assets/logo.png" alt="Logo" class="logo" onerror="this.src='/api/placeholder/150/150'; this.onerror=null;">
      </div>
      <h1>TÚ-sí sabes</h1>
      
      <div class="role-buttons">
        <button id="fiestero-btn" class="role-btn">Fiestero</button>
        <button id="organizador-btn" class="role-btn">Organizador</button>
      </div>
      
      <div class="report-access">
        <h3>Ingresar un código de reporte</h3>
        <div class="report-form">
          <input type="text" id="report-id" placeholder="ID del reporte" class="report-input">
          <button id="access-report-btn" class="report-btn">Ir al informe</button>
        </div>
        <p id="report-message" class="message ${data.messageType || ""}">
          ${data.message || ""}
        </p>
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

  // Evento para acceder a un reporte específico
  document
    .getElementById("access-report-btn")
    .addEventListener("click", async function () {
      const reportId = document.getElementById("report-id").value.trim();

      if (!reportId) {
        document.getElementById("report-message").textContent =
          "Por favor, ingresa un ID de reporte válido";
        document.getElementById("report-message").className = "message error";
        return;
      }

      navigateTo("/search-report", { reportId });
    });
}
