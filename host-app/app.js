// app.js
import renderLogin from "./screens/login.js";
import renderRegister from "./screens/register.js";
import renderDashboard from "./screens/dashboard.js";
import renderEventDetails from "./screens/eventDetails.js";

const socket = io("/", { path: "/real-time" });

function clearScripts() {
  document.getElementById("app").innerHTML = "";
}

let route = { path: "/", data: {} };

function renderCurrentRoute() {
  switch (route.path) {
    case "/":
    case "/login":
      clearScripts();
      renderLogin(route.data);
      break;
    case "/register":
      clearScripts();
      renderRegister(route.data);
      break;
    case "/dashboard":
      clearScripts();
      renderDashboard(route.data);
      break;
    case "/event-details":
      clearScripts();
      renderEventDetails(route.data);
      break;
    default:
      const app = document.getElementById("app");
      app.innerHTML = `<h1>404 - Not Found</h1><p>La página que estás buscando no existe.</p>`;
  }
}

// Función temporal para dashboard
// function renderDashboard(data = {}) {
//   // Obtener la fecha actual
//   const now = new Date();
//   const options = { weekday: "long", month: "short" };
//   const dateFormatter = new Intl.DateTimeFormat("es-ES", options);
//   const parts = dateFormatter.formatToParts(now);
//   // Extraer día de la semana y mes
//   const weekday = parts.find((part) => part.type === "weekday").value;
//   const month = parts.find((part) => part.type === "month").value;
//   // Obtener el día del mes
//   const day = now.getDate();

//   const formattedDate = `${weekday}, ${day} ${month}`;

//   const app = document.getElementById("app");
//   app.innerHTML = `
//     <section class="dashboard-container">
//       <div class="tabs">
//         <div class="tab active">Home</div>
//         <div class="tab">Mi pedido</div>
//         <div class="tab">Resultados</div>
//       </div>
//     <div class="dashboard-header">
//       <h2>¡Hola! ${data.user ? data.user.username : ""}, ¿Qué haremos hoy?</h2>
//         <p class="date">${formattedDate}</p>
//         <div class="message success">${data.message || ""}</div>
//         <button id="logout-btn" class="btn btn-primary">Cerrar Sesión</button>
//       </div>
//     </section>
//   `;

//   document.getElementById("logout-btn").addEventListener("click", function () {
//     navigateTo("/login");
//   });
// }

function navigateTo(path, data = {}) {
  route = { path, data };
  renderCurrentRoute();
  // También podríamos actualizar la URL aquí con history.pushState
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

socket.on("change-screen", (data) => {
  console.log("Evento de cambio de pantalla recibido:", data);
  navigateTo(data.path, data.data);
});

socket.on("change-status", (data) => {
  console.log(`Cambio de estado del evento a ${data.event.status}`);
});

export { navigateTo, socket, makeRequest };
