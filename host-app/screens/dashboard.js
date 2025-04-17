import { makeRequest, navigateTo } from "../app.js";

export default function renderDashboard(data = {}) {
    // Obtener la fecha actual
    const now = new Date();
    const options = { weekday: "long", month: "short" };
    const dateFormatter = new Intl.DateTimeFormat("es-ES", options);
    const parts = dateFormatter.formatToParts(now);
    // Extraer día de la semana y mes
    const weekday = parts.find((part) => part.type === "weekday").value;
    const month = parts.find((part) => part.type === "month").value;
    // Obtener el día del mes
    const day = now.getDate();

    const formattedDate = `${weekday}, ${day} ${month}`;

    const app = document.getElementById("app");
    app.innerHTML = `
        <section class="dashboard-container">
        <div class="tabs">
            <div class="tab active">Home</div>
            <div class="tab">Mi pedido</div>
            <div class="tab">Resultados</div>
        </div>
        <div class="dashboard-header">
            <h2>¡Hola! ${data.user ? data.user.username : ""}, ¿Qué haremos hoy?</h2>
            <p class="date">${formattedDate}</p>
            <div id="event-creation">
                <h3>¡Llévanos a un evento!</h3>
                <form id="event-form">
                    <input type="text" id="event-name" placeholder="Nombre del evento" required>
                    <input type="email" id="host-email" placeholder="Correo del solicitante" required>
                    <input type="text" id="event-location" placeholder="Dirección del evento" required>
                    <label for="event-start-date">Fecha y hora de inicio:</label>
                    <input type="datetime-local" id="event-start-date" required>
                    <label for="event-end-date">Fecha y hora de fin:</label>
                    <input type="datetime-local" id="event-end-date" required>
                    <textarea id="event-description" placeholder="Descripción del evento" required></textarea>
                    <input type="text" id="event-link" placeholder="Enlaza una URL del evento">
                    <button type="submit" id="create-event-btn">Agendar</button>
                </form>
            </div>
            <div class="message success">${data.message || ""}</div> 
            <button id="logout-btn" class="btn btn-primary">Cerrar Sesión</button>
        </div>
        </section>
    `;

    document.getElementById("event-form").addEventListener("submit", async (e) => {
        e.preventDefault();

        const eventName = document.getElementById("event-name").value;
        const hostEmail = document.getElementById("host-email").value;
        const eventLocation = document.getElementById("event-location").value;
        let eventStartDate = document.getElementById("event-start-date").value;
        let eventEndDate = document.getElementById("event-end-date").value;
        const eventDescription = document.getElementById("event-description").value;
        const eventLink = document.getElementById("event-link").value || null;

        // Validar que la fecha de inicio sea anterior a la fecha de fin
        if (eventStartDate >= eventEndDate) {
            alert("La fecha de inicio debe ser anterior a la fecha de fin.");
            return;
        };
        eventStartDate = new Date(eventStartDate).toLocaleString("es-CO", {"timeZone": "America/Bogota"});
        eventEndDate = new Date(eventEndDate).toLocaleString("es-CO", {"timeZone": "America/Bogota"});

        const data = {
            eventName,
            hostEmail,
            eventLocation,
            eventStartDate,
            eventEndDate,
            eventDescription,
            eventLink,
        };

        try {
            const res = await makeRequest("/new-event", "POST", data);

            if (res.code === 200) {
                // NAVIGATE TO EVENTDETAILS WITH THE EVENT AS DATA
                navigateTo("/event-details", { user: data.user, event: res.event });
                alert(res.message);
            } else {
                // Lanzar mensaje de error
                throw new Error(res.message);
            }
        } catch (error) {
            document.getElementById("event-creation").innerHTML = `<h5 class="message error">${res.message}</h5>`;
            alert(error.message);
        };
    });

    document.getElementById("logout-btn").addEventListener("click", function () {
        navigateTo("/login");
    });
}