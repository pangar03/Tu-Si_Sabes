import { makeRequest, navigateTo, socket } from "../app.js";

export default function renderEventDetails(data = {}) {
    console.log("DATA", data);
    socket.on("change-status", (res) => {
        renderEventDetails({...data, event: res.event});
    });
    
    const app = document.getElementById("app");
    app.innerHTML = `
        <div id="event-details-header">
            <h2>${data.event.eventName}</h2>
            <p>Inicio: ${data.event.eventStartDate}</p>    
            <p>Fin: ${data.event.eventEndDate}</p>    
            <h4>${data.event.eventLocation}</h4>
        </div>
        <div id="event-details-body">
            <h3>Detalles del evento</h3>
            <p>${data.event.eventDescription}</p>    
        </div>
        <div id="event-details-buttons"></div>
    `;

    // console.log("DATA", data);
    
    switch(data.event.status) {
        case "pending":
            pendingStatus(data);
            break;
        case "confirmed":
            confirmedStatus(data);
            break;
        case "on-transit":
            confirmedStatus(data);
            break;
        case "on-site":
            onSiteStatus(data);
            break;
        case "analizing":
            navigateTo("/results-page", data);
            break;
        default:
            break;
    }
};

async function pendingStatus(data) {
    const container = document.getElementById("event-details-buttons");
    container.innerHTML = `
        <button class="btn btn-primary" id="confirm-event">Confirmar Evento</button>
    `;

    document.getElementById("confirm-event").addEventListener("click", async () => {
        const response = await makeRequest(`/event/${data.event.id}/change-status`, "POST", {
            status: "confirmed"
        });
    });
};

async function confirmedStatus(data) {
    const container = document.getElementById("event-details-buttons");
    container.innerHTML = `
        <button class="btn btn-primary" id="on-transit-event">Ir al lugar</button>
        <button class="btn btn-primary" id="on-site-event">Anunciar llegada</button>
    `;
    
    document.getElementById("on-transit-event").addEventListener("click", async () => {
        const response = await makeRequest(`/event/${data.event.id}/change-status`, "POST", {
            status: "on-transit"
        });
        alert("Anunciando salida hacia el lugar del evento");
    });

    document.getElementById("on-site-event").addEventListener("click", async () => {
        const response = await makeRequest(`/event/${data.event.id}/change-status`, "POST", {
            status: "on-site"
        });
        alert("Anunciando llegada al lugar del evento");
    });
};

async function onSiteStatus(data) {
    const container = document.getElementById("event-details-buttons");
    container.innerHTML = `
        <button class="btn btn-primary" id="analizing-event">Empezar análisis</button>
    `;

    document.getElementById("analizing-event").addEventListener("click", async () => {
        const response = await makeRequest(`/event/${data.event.id}/change-status`, "POST", {
            status: "analizing"
        });
        alert("Empezando análisis de sustancias evento");
    });
};