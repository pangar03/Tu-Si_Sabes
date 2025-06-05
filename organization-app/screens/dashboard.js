import { makeRequest, navigateTo } from "../app.js";
import { socket } from "../app.js";

export default async function renderDashboard(data = {}) {
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
            <div id="dashboard-header">
                <h2>¿Qué hay para hoy?</h2>
                <p class="date">${formattedDate}</p>
            </div>
            <div id="event-list"></div>
        </section>
    `;

  // GET Inicial de los eventos
  const eventList = await makeRequest("/events", "GET", {});
  const eventContainer = document.getElementById("event-list");

  if (eventList) {
    eventList.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.className = "event-card";
      eventCard.innerHTML = `
                <h3>${event.eventName}</h3>
                <p>${event.eventLocation}</p>
                <div>
                    <div>
                        <p>Inicio: ${event.eventStartDate}</p>
                        <p>Fin: ${event.eventEndDate}</p>
                    </div>
                    <button class="btn btn-primary" id="event-${event.id}">Ver Mas</button>
                </div>
            `;

      // Usar event.id que es el ID real de la base de datos
      eventCard
        .querySelector(`#event-${event.id}`)
        .addEventListener("click", () => {
          // Navegar a la pantalla de detalles del evento
          navigateTo("/event-details", { ...data, event });
        });

      eventContainer.appendChild(eventCard);
    });
  }

  // Escuchar eventos de Socket.io para actualizaciones en tiempo real
  socket.on("new-event", (event) => {
    // Renderizamos el nuevo evento
    const eventCard = document.createElement("div");
    eventCard.className = "event-card";
    eventCard.innerHTML = `
            <h3>${event.eventName}</h3>
            <p>${event.eventLocation}</p>
            <div>
                <div>
                    <p>Inicio: ${event.eventStartDate}</p>
                    <p>Fin: ${event.eventEndDate}</p>
                </div>
                <button class="btn btn-primary" id="event-${event.id}">Ver Mas</button>
            </div>
        `;

    // Usar event.id que es el ID real de la base de datos
    eventCard
      .querySelector(`#event-${event.id}`)
      .addEventListener("click", () => {
        // Navegar a la pantalla de detalles del evento
        navigateTo("/event-details", { ...data, event });
      });

    eventContainer.appendChild(eventCard);
  });
}
