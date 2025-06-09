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
            <div class="tab active" id="home-tab">Home</div>
            <div class="tab" id="orders-tab">Mi pedido</div>
            <div class="tab" id="results-tab">Resultados</div>
        </div>
        <div class="dashboard-header">
            <h2>¡Hola! ${
              data.user ? data.user.username : ""
            }, ¿Qué haremos hoy?</h2>
            <p class="date">${formattedDate}</p>
            
            <!-- Sección Home -->
            <div id="home-section">
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
            </div>
            
            <!-- Sección Mi pedido -->
            <div id="orders-section" style="display: none;">
                <div id="orders-content">
                    <h3>Mis eventos</h3>
                    <div id="events-container">
                        <div class="loading">Cargando eventos...</div>
                    </div>
                </div>
            </div>
            
            <!-- Sección Resultados -->
            <div id="results-section" style="display: none;">
                <div id="results-content">
                    <h3>Resultados completados</h3>
                    <div id="completed-events-container">
                        <div class="loading">Cargando resultados...</div>
                    </div>
                </div>
            </div>
            
            <button id="logout-btn" class="btn btn-primary">Cerrar Sesión</button>
        </div>
        </section>
    `;

  // Event listeners para los tabs
  document.getElementById("home-tab").addEventListener("click", () => {
    switchTab("home");
  });

  document.getElementById("orders-tab").addEventListener("click", () => {
    switchTab("orders");
    loadUserEvents(data.user.id);
  });

  document.getElementById("results-tab").addEventListener("click", () => {
    switchTab("results");
    loadCompletedEvents(data.user.id);
  });

  // Función para cambiar entre tabs
  function switchTab(tab) {
    // Remover active de todos los tabs
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));

    // Ocultar todas las secciones
    document.getElementById("home-section").style.display = "none";
    document.getElementById("orders-section").style.display = "none";
    document.getElementById("results-section").style.display = "none";

    if (tab === "home") {
      document.getElementById("home-tab").classList.add("active");
      document.getElementById("home-section").style.display = "block";
    } else if (tab === "orders") {
      document.getElementById("orders-tab").classList.add("active");
      document.getElementById("orders-section").style.display = "block";
    } else if (tab === "results") {
      document.getElementById("results-tab").classList.add("active");
      document.getElementById("results-section").style.display = "block";
    }
  }

  // Función para cargar eventos del usuario
  async function loadUserEvents(userId) {
    const eventsContainer = document.getElementById("events-container");
    eventsContainer.innerHTML =
      '<div class="loading">Cargando eventos...</div>';

    try {
      const response = await makeRequest(
        `/events?userId=${userId}&isOrg=false`,
        "GET"
      );

      if (response && Array.isArray(response)) {
        // Filtrar eventos que no estén en estado "completed"
        // Incluir analyzing y results como eventos activos
        const activeEvents = response.filter(
          (event) => event.status !== "completed"
        );

        if (activeEvents.length === 0) {
          eventsContainer.innerHTML = `
            <div class="no-events">
              <h4>No tienes eventos activos</h4>
              <p>Crea tu primer evento desde la pestaña Home</p>
            </div>
          `;
          return;
        }

        // Crear tarjetas de eventos
        const eventsHTML = activeEvents
          .map((event) => createEventCard(event))
          .join("");
        eventsContainer.innerHTML = eventsHTML;

        // Agregar event listeners a las tarjetas
        activeEvents.forEach((event) => {
          document
            .getElementById(`event-card-${event.id}`)
            .addEventListener("click", () => {
              navigateTo("/event-details", { user: data.user, event: event });
            });
        });
      } else {
        eventsContainer.innerHTML = `
          <div class="error-message">
            <h4>Error al cargar eventos</h4>
            <p>No se pudieron cargar tus eventos. Intenta nuevamente.</p>
            <button onclick="loadUserEvents(${userId})" class="btn btn-secondary">Reintentar</button>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error loading events:", error);
      eventsContainer.innerHTML = `
        <div class="error-message">
          <h4>Error de conexión</h4>
          <p>No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.</p>
          <button onclick="loadUserEvents(${userId})" class="btn btn-secondary">Reintentar</button>
        </div>
      `;
    }
  }

  // Función para cargar eventos completados
  async function loadCompletedEvents(userId) {
    const completedEventsContainer = document.getElementById(
      "completed-events-container"
    );
    completedEventsContainer.innerHTML =
      '<div class="loading">Cargando resultados...</div>';

    try {
      const response = await makeRequest(
        `/events?userId=${userId}&isOrg=false`,
        "GET"
      );

      if (response && Array.isArray(response)) {
        // Filtrar eventos que estén en estado "completed"
        const completedEvents = response.filter(
          (event) => event.status === "completed"
        );

        if (completedEvents.length === 0) {
          completedEventsContainer.innerHTML = `
            <div class="no-events">
              <h4>No tienes resultados disponibles</h4>
              <p>Los resultados aparecerán aquí una vez que tus eventos sean completados</p>
            </div>
          `;
          return;
        }

        // Crear tarjetas de resultados
        const resultsHTML = completedEvents
          .map((event) => createResultCard(event))
          .join("");
        completedEventsContainer.innerHTML = resultsHTML;

        // Agregar event listeners a las tarjetas de resultados
        completedEvents.forEach((event) => {
          document
            .getElementById(`result-card-${event.id}`)
            .addEventListener("click", () => {
              // Navegar a reportView con el evento
              navigateTo("/report-view", { event: event });
            });
        });
      } else {
        completedEventsContainer.innerHTML = `
          <div class="error-message">
            <h4>Error al cargar resultados</h4>
            <p>No se pudieron cargar los resultados. Intenta nuevamente.</p>
            <button onclick="loadCompletedEvents(${userId})" class="btn btn-secondary">Reintentar</button>
          </div>
        `;
      }
    } catch (error) {
      console.error("Error loading completed events:", error);
      completedEventsContainer.innerHTML = `
        <div class="error-message">
          <h4>Error de conexión</h4>
          <p>No se pudo conectar con el servidor. Verifica tu conexión e intenta nuevamente.</p>
          <button onclick="loadCompletedEvents(${userId})" class="btn btn-secondary">Reintentar</button>
        </div>
      `;
    }
  }

  // Función para crear tarjeta de evento
  function createEventCard(event) {
    const statusText = getStatusText(event.status);
    const statusClass = getStatusClass(event.status);

    return `
      <div class="event-card ${statusClass}" id="event-card-${event.id}">
        <div class="event-card-header">
          <h4>${event.eventName}</h4>
          <span class="event-status">${statusText}</span>
        </div>
        <div class="event-card-body">
          <p class="event-location">📍 ${event.eventLocation}</p>
          <p class="event-date">📅 ${formatEventDate(event.eventStartDate)}</p>
          <p class="event-created">Creado: ${event.createdAt}</p>
        </div>
        <div class="event-card-footer">
          <button class="btn btn-outline">Ver detalles</button>
        </div>
      </div>
    `;
  }

  // Función para crear tarjeta de resultado
  function createResultCard(event) {
    const substanceCount = event.substances ? event.substances.length : 0;

    return `
      <div class="result-card completed" id="result-card-${event.id}">
        <div class="result-card-header">
          <h4>${event.eventName}</h4>
          <span class="result-status">✅ Completado</span>
        </div>
        <div class="result-card-body">
          <p class="event-location">📍 ${event.eventLocation}</p>
          <p class="event-date">📅 ${formatEventDate(event.eventStartDate)}</p>
          <p class="event-created">Creado: ${event.createdAt}</p>
          <p class="substances-count">🧪 ${substanceCount} análisis ${
      substanceCount === 1 ? "realizado" : "realizados"
    }</p>
          <p class="report-id">ID del informe: ${event.id}</p>
        </div>
        <div class="result-card-footer">
          <button class="btn btn-primary">Ver resultados completos</button>
        </div>
      </div>
    `;
  }

  // Función para obtener texto del estado - CORREGIDA
  function getStatusText(status) {
    const statusMap = {
      pending: "Pendiente",
      confirmed: "Confirmado",
      "on-transit": "En camino",
      "on-site": "En sitio",
      analyzing: "Analizando", // CORREGIDO: era "analizing"
      analizing: "Analizando", // AGREGADO: mantener compatibilidad
      results: "Resultados listos", // CORREGIDO: ya estaba bien
      completed: "Completado",
    };
    return statusMap[status] || "Desconocido";
  }

  // Función para obtener clase CSS del estado - CORREGIDA
  function getStatusClass(status) {
    return `status-${status}`;
  }

  // Función para formatear fecha del evento
  function formatEventDate(dateString) {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("es-CO", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return dateString;
    }
  }

  // Event listener para el formulario de eventos (existente)
  document
    .getElementById("event-form")
    .addEventListener("submit", async (e) => {
      e.preventDefault();

      // Verificar que el usuario esté presente
      if (!data.user || !data.user.id) {
        alert(
          "Error: No se ha encontrado información del usuario. Por favor, inicia sesión nuevamente."
        );
        navigateTo("/login");
        return;
      }

      const eventName = document.getElementById("event-name").value;
      const hostEmail = document.getElementById("host-email").value;
      const eventLocation = document.getElementById("event-location").value;
      let eventStartDate = document.getElementById("event-start-date").value;
      let eventEndDate = document.getElementById("event-end-date").value;
      const eventDescription =
        document.getElementById("event-description").value;
      const eventLink = document.getElementById("event-link").value || null;

      // Validar que la fecha de inicio sea anterior a la fecha de fin
      if (eventStartDate >= eventEndDate) {
        alert("La fecha de inicio debe ser anterior a la fecha de fin.");
        return;
      }

      eventStartDate = new Date(eventStartDate).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      });
      eventEndDate = new Date(eventEndDate).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
      });

      const eventData = {
        eventName,
        hostEmail,
        eventLocation,
        eventStartDate,
        eventEndDate,
        eventDescription,
        eventLink,
        userId: data.user.id,
      };

      try {
        const res = await makeRequest("/new-event", "POST", eventData);

        if (res.code === 200) {
          // NAVIGATE TO EVENTDETAILS WITH THE EVENT AS DATA
          navigateTo("/event-details", { user: data.user, event: res.event });
          alert(res.message);
        } else {
          // Lanzar mensaje de error
          throw new Error(res.message);
        }
      } catch (error) {
        document.getElementById(
          "event-creation"
        ).innerHTML = `<h5 class="message error">${error.message}</h5>`;
        alert(error.message);
      }
    });

  document.getElementById("logout-btn").addEventListener("click", function () {
    navigateTo("/login");
  });

  // Hacer las funciones disponibles globalmente para los botones de reintentar
  window.loadUserEvents = loadUserEvents;
  window.loadCompletedEvents = loadCompletedEvents;
}
