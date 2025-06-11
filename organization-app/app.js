import renderDashboard from "./screens/dashboard.js";
import renderEventDetails from "./screens/eventDetails.js";
import renderLogin from "./screens/login.js";
import renderResultsPage from "./screens/resultsPage.js";

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
        // case "/register":
        //     clearScripts();
        //     break;
        case "/dashboard":
            clearScripts();
            renderDashboard(route.data);
            break;
        case "/event-details":
            clearScripts();
            renderEventDetails(route.data);
            break;
        case "/results-page":
            clearScripts();
            renderResultsPage(route.data);
            break;
        default:
            const app = document.getElementById("app");
            app.innerHTML = `<h1>404 - Not Found</h1><p>La página que estás buscando no existe.</p>`;
    }
}

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
