import renderHomeScreen from "./screens/homeScreen.js";
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
      clearScripts();
      renderHomeScreen(route.data);
      break;
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

// Función para detectar y manejar navegación desde host-app
function handleDirectNavigation() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get("action");
  const eventId = urlParams.get("eventId");

  if (action === "viewReport" && eventId) {
    // Intentar obtener datos del evento desde sessionStorage
    const eventDataFromStorage = sessionStorage.getItem("reportEventData");

    if (eventDataFromStorage) {
      try {
        const eventData = JSON.parse(eventDataFromStorage);
        // Limpiar sessionStorage después de usar los datos
        sessionStorage.removeItem("reportEventData");
        // Navegar directamente al reporte con los datos
        navigateTo("/report-view", { event: eventData });
        return true;
      } catch (error) {
        console.error(
          "Error al parsear datos del evento desde sessionStorage:",
          error
        );
      }
    }

    // Si no hay datos en sessionStorage, cargar desde el servidor
    loadEventAndShowReport(eventId);
    return true;
  }

  return false;
}

// Función para cargar evento desde el servidor y mostrar el reporte
async function loadEventAndShowReport(eventId) {
  try {
    const eventData = await makeRequest(`/event/${eventId}`, "GET");
    if (eventData && eventData.id) {
      navigateTo("/report-view", { event: eventData });
    } else {
      navigateTo("/search-report", {
        message: "No se pudo cargar el evento solicitado",
        messageType: "error",
      });
    }
  } catch (error) {
    console.error("Error al cargar el evento:", error);
    navigateTo("/search-report", {
      message: "Error al cargar el evento. Intenta nuevamente.",
      messageType: "error",
    });
  }
}

// Inicializar la aplicación
// Primero verificar si viene navegación directa desde host-app
if (!handleDirectNavigation()) {
  // Si no es navegación directa, renderizar la ruta normal
  renderCurrentRoute();
}

// Configurar escucha de eventos de Socket.io
socket.on("connect", () => {
  console.log("Conectado al servidor de Socket.io");
});

export { navigateTo, socket, makeRequest };
