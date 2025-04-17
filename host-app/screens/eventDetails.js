import { socket } from "../app.js";

export default function renderEventDetails(data = {}) {
    socket.on("change-status", (data) => {
        renderEventDetails(data);
    });
    
    const app = document.getElementById("app");
    app.innerHTML = `<div class="event-details-container">
                        <h2>${data.event.eventName}</h2>
                        <h4>${data.event.eventLocation}</h4>
                        <p>Inicio: ${data.event.eventStartDate}</p>    
                        <p>Fin: ${data.event.eventEndDate}</p>    
                        <p>Estado: ${data.event.status}</p>
                        <div id="status-message"></div>  
                    </div>
    `;

    const status = data.event.status;

    switch(status) {
        case "pending":
            break;
        case "confirmed":
            renderConfirmed();
            break;
        case "on-transit":
            renderOnTransit();
            break;
        case "on-site":
            renderOnSite();
            break;
        case "analizing":
            renderAnalizing();
            break;
        case "results":
            alert("Resultados disponibles");
            break;
        default:
            break;
    }
};

const renderConfirmed = () => {
    const container = document.getElementById("status-message");

    container.innerHTML = `
        <h3>¡Échele Cabeza ha confirmado su asistencia!</h3>
        <p>Ten paciencia, siempre llegamos a tiempo. Ya hemos confirmado nuestra asistencia y estaremos pronto dándola toda.</p>
    `;
};

const renderOnTransit = () => {
    const container = document.getElementById("status-message");

    container.innerHTML = `
        <h3>¡Échele Cabeza está en camino!</h3>
        <p>Ten paciencia, siempre llegamos a tiempo. Ya hemos confirmado nuestra asistencia y estaremos pronto dándola toda.</p>
    `;
};

const renderOnSite = () => {
    const container = document.getElementById("status-message");

    container.innerHTML = `
        <h3>¡Llegamos!</h3>
        <p>Abre la puerta, nuestro equipo está listo para apoyar tu evento de la mejor manera.</p>
    `;
};

const renderAnalizing = () => {
    const container = document.getElementById("status-message");

    container.innerHTML = `
        <h3>¡Espera un poco más, estámos analizando!</h3>
    `;
};
