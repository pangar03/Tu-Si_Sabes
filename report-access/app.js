import renderSearchReport from "./screens/searchReport.js";
import renderReportView from "./screens/reportView.js";

const socket = io("/", { path: "/real-time" });

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

let route = { path: "/", data: {} };

function renderCurrentRoute() {
  switch (route.path) {
    case "/":
    case "/search-report":
      clearScripts();
      renderSearchReport(route.data);
      break;
    case "/report-view":
      clearScripts();
      renderReportView(route.data);
      break;
    default:
      const app = document.getElementById("app");
      app.innerHTML = `<h1>404 - Not Found</h1><p>La página que estás buscando no existe.</p>`;
  }
}

function navigateTo(path, data = {}) {
  route = { path, data };
  renderCurrentRoute();
}

async function makeRequest(url, method, body) {
  const BASE_URL = "http://localhost:5050";
  try {
    const options = {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (body && (method === "POST" || method === "PUT")) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${url}`, options);
    return await response.json();
  } catch (error) {
    console.error("Error en la solicitud:", error);
    return { code: 500, message: "Error de conexión con el servidor" };
  }
}

// Inicializar la aplicación
renderCurrentRoute();

// Configurar escucha de eventos de Socket.io
socket.on("connect", () => {
  console.log("Conectado al servidor de Socket.io");
});

export { navigateTo, socket, makeRequest };
