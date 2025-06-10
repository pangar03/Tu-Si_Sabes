import { makeRequest } from "../app.js";
import { socket } from "../app.js";

export default async function renderResultsPage(data = {}) {
  const substancesData = await makeRequest("/substances", "GET");
  const adulterantsData = await makeRequest("/adulterants", "GET");

  const substances = substancesData.substances;
  const adulterants = adulterantsData.adulterants;

  // Verificar si está en modo solo lectura (evento completado)
  const isReadOnly = data.readOnly || data.event.status === "completed";

  // SOLUCIÓN: Limpiar todos los listeners previos para evitar conflictos
  socket.off("add-substance");
  socket.off("change-status");

  // Solo agregar listeners de socket si no es modo solo lectura
  if (!isReadOnly) {
    // En lugar de re-renderizar toda la página, solo actualizar la lista de sustancias
    socket.on("add-substance", (res) => {
      console.log("Nueva sustancia agregada:", res.event);
      updateSubstanceList(res.event.substances);
    });
  }

  const app = document.getElementById("app");
  app.innerHTML = `
  <div class="dashboard-header">
        <div id="substance-register">
            <form id="substance-form">
                    <div id="event-details-header">
            <h2>${data.event.eventName}</h2>
            <p>Inicio: ${data.event.eventStartDate}</p>    
            <p>Fin: ${data.event.eventEndDate}</p>    
            <p>${data.event.eventLocation}</p>
            <h4>ID del informe: ${data.event.id}</h4>
            ${
              isReadOnly
                ? '<div class="readonly-banner" style="background-color: #f8f9fa; border: 1px solid #dee2e6; padding: 10px; margin: 10px 0; border-radius: 4px; color: #6c757d; font-weight: bold;">📋 Modo Solo Lectura - Evento Completado</div>'
                : ""
            }
        </div>
        ${
          !isReadOnly
            ? `
            <!-- NUEVO: Contenedor para mensajes -->
            <div id="messages-container"></div>
            
            <h3>Registro de sustancias</h3>
            <p>Recuerde que si la sustancia no aparece en la base de datos, recuerde seleccionar "Sustancia no registrada" e incluya las consideraciones adicionales</p>
                <input type="text" id="reported-substance" placeholder="Sustancia reportada a analizar" required>
                <label for="primary-substance">Sustancia primaria</label>
                <select id="primary-substance" required>
                    <option value="">Seleccione una sustancia</option>
                    ${substances
                      .map(
                        (substance) =>
                          `<option value="${substance.id}">${substance.nombre_comun}</option>`
                      )
                      .join("")}
                    ${adulterants
                      .map(
                        (adulterant) =>
                          `<option value="${adulterant.id}">${adulterant.nombre_comun}</option>`
                      )
                      .join("")}
                    <option value="other">Sustancia no registrada</option>
                </select>
                <input type="text" id="primary-substance-other" placeholder="Ingrese el nombre de la sustancia hallada" style="display: none;"></input>
    <div class="form-check">
    <label for="adulterant-presence">¿Se ha encontrado algún adulterante?</label>
        <input type="checkbox" id="adulterant-presence" value="false">
    </div>
                <label for="adulterant">Adulterante presente</label>
                <select id="adulterant" disabled>
                    <option value="">Seleccione un adulterant</option>
                    ${adulterants
                      .map(
                        (adulterant) =>
                          `<option value="${adulterant.id}">${adulterant.nombre_comun}</option>`
                      )
                      .join("")}
                    <option value="other">Sustancia no registrada</option>
                </select>
                <input type="text" id="adulterant-substance-other" placeholder="Ingrese el nombre de la sustancia hallada" style="display: none;"></input>
                <textarea id="considerations" placeholder="Consideraciones adicionales"></textarea>
                <button type="submit" id="submit-substance">Registrar Sustancia</button>
            </form>
        </div>
        </div>
        `
            : ""
        }
        <!-- Contenedor para la lista de sustancias -->
        <div id="substance-list-container">
            <h3>Sustancias Registradas</h3>
            <ul id="substance-list"></ul>
        </div>`;

  // Función para actualizar solo la lista de sustancias
  function updateSubstanceList(substances) {
    const substanceList = document.getElementById("substance-list");
    if (!substanceList) return;

    substanceList.innerHTML = "";

    if (substances && substances.length > 0) {
      substances.forEach((substance, index) => {
        const substanceItem = document.createElement("li");
        substanceItem.style.cssText = `
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 10px;
          background-color: #fff;
        `;
        substanceItem.innerHTML = `
                    <h4 style="color: #495057; margin-bottom: 10px;">Muestra #${
                      index + 1
                    } - Sustancia reportada como "${
          substance.reported_substance
        }"</h4>
                    <p style="margin-bottom: 5px;"><strong>Sustancia primaria:</strong> ${
                      substance.primary_substance
                    }</p>
                    <p style="margin-bottom: 5px;"><strong>Adulterante:</strong> ${
                      substance.adulterant ||
                      "No se encontraron adulterantes en la sustancia"
                    }</p>
                    <p style="margin-bottom: 0;"><strong>Consideraciones:</strong> ${
                      substance.considerations ||
                      "No se sugirieron consideraciones adicionales"
                    }</p>
                `;
        substanceList.appendChild(substanceItem);
      });
    } else {
      const noSubstancesMessage = document.createElement("li");
      noSubstancesMessage.innerHTML = `<p>No se han registrado sustancias aún.</p>`;
      substanceList.appendChild(noSubstancesMessage);
    }
  }

  // Solo agregar funcionalidad del formulario si no es modo solo lectura
  if (!isReadOnly) {
    // Mostrar el input de "Sustancia no registrada" al seleccionar la opción
    const primarySubstanceSelect = document.getElementById("primary-substance");
    const primarySubstanceOtherInput = document.getElementById(
      "primary-substance-other"
    );
    primarySubstanceSelect.addEventListener("change", () => {
      if (primarySubstanceSelect.value === "other") {
        primarySubstanceOtherInput.style.display = "block";
        primarySubstanceOtherInput.required = true;
      } else {
        primarySubstanceOtherInput.style.display = "none";
        primarySubstanceOtherInput.required = false;
      }
    });

    const adulterantSelect = document.getElementById("adulterant");
    const adulterantSubstanceOtherInput = document.getElementById(
      "adulterant-substance-other"
    );
    adulterantSelect.addEventListener("change", () => {
      if (adulterantSelect.value === "other") {
        adulterantSubstanceOtherInput.style.display = "block";
        adulterantSubstanceOtherInput.required = true;
      } else {
        adulterantSubstanceOtherInput.style.display = "none";
        adulterantSubstanceOtherInput.required = false;
      }
    });

    // Habilitar/Deshabilitar el select de adulterantes al inicio
    const adulterantPresence = document.getElementById("adulterant-presence");
    adulterantPresence.addEventListener("change", () => {
      if (adulterantPresence.checked) {
        adulterantSelect.disabled = false;
      } else {
        adulterantSelect.disabled = true;
        adulterantSelect.value = "";
        adulterantSubstanceOtherInput.style.display = "none";
        adulterantSubstanceOtherInput.required = false;
      }
    });

    // Formulario de registro de sustancias
    const substanceForm = document.getElementById("substance-form");
    substanceForm.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Usar siempre data.event.id que es el ID real de la base de datos
      const eventId = data.event.id;

      const reportedSubstance =
        document.getElementById("reported-substance").value;
      let primarySubstance = document.getElementById("primary-substance").value;
      primarySubstance =
        primarySubstance === "other"
          ? primarySubstanceOtherInput.value
          : primarySubstance;
      const adulterantPresenceValue = document.getElementById(
        "adulterant-presence"
      ).checked;
      let adulterant = document.getElementById("adulterant").value;
      adulterant =
        adulterant === "other"
          ? adulterantSubstanceOtherInput.value
          : adulterant;
      const considerations = document.getElementById("considerations").value;

      // Deshabilitar el botón de envío para evitar envíos múltiples
      const submitButton = document.getElementById("submit-substance");
      const originalButtonText = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.textContent = "Registrando...";

      try {
        // Agregar la sustancia al evento
        const response = await makeRequest(
          `/event/${eventId}/substance`,
          "POST",
          {
            id: Date.now(),
            eventId: eventId,
            reported_substance: reportedSubstance,
            primary_substance: primarySubstance,
            adulterant_presence: adulterantPresenceValue,
            adulterant: adulterant,
            considerations: considerations,
          }
        );

        console.log("Response from adding substance:", response);

        if (response.code === 200) {
          // Actualizar la data local del evento para mantener sincronización
          data.event = response.event;

          // SOLUCIÓN: Solo cambiar el estado si es la primera sustancia
          // y el estado actual es "analyzing"
          if (
            data.event.status === "analyzing" &&
            data.event.substances.length === 1
          ) {
            const statusResponse = await makeRequest(
              `/event/${eventId}/change-status`,
              "POST",
              {
                status: "results",
              }
            );
            console.log("Response from status change:", statusResponse);
            if (statusResponse.code === 200) {
              data.event = statusResponse.event;
            }
          }

          // Limpiar el formulario después de enviar
          resetForm();

          // Mostrar mensaje de éxito
          showSuccessMessage("Sustancia registrada exitosamente");

          // Actualizar la lista de sustancias localmente
          updateSubstanceList(data.event.substances);
        } else {
          throw new Error(
            response.message || "Error al registrar la sustancia"
          );
        }
      } catch (error) {
        console.error("Error processing substance:", error);
        showErrorMessage(
          "Error al procesar la sustancia. Por favor, intente nuevamente."
        );
      } finally {
        // Rehabilitar el botón de envío
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      }
    });

    // Función para resetear el formulario
    function resetForm() {
      const formToReset = document.getElementById("substance-form");
      if (formToReset) {
        formToReset.reset();

        // Resetear los campos adicionales manualmente
        const primaryOtherInput = document.getElementById(
          "primary-substance-other"
        );
        const adulterantOtherInput = document.getElementById(
          "adulterant-substance-other"
        );
        const adulterantSelectElement = document.getElementById("adulterant");

        if (primaryOtherInput) {
          primaryOtherInput.style.display = "none";
          primaryOtherInput.required = false;
        }

        if (adulterantOtherInput) {
          adulterantOtherInput.style.display = "none";
          adulterantOtherInput.required = false;
        }

        if (adulterantSelectElement) {
          adulterantSelectElement.disabled = true;
        }
      }
    }

    // Función para mostrar mensajes de éxito
    function showSuccessMessage(message) {
      const existingMessage = document.querySelector(".success-message");
      if (existingMessage) {
        existingMessage.remove();
      }

      const messageDiv = document.createElement("div");
      messageDiv.className = "success-message";
      messageDiv.style.cssText = `
        background-color: #d4edda;
        color: #155724;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #c3e6cb;
        border-radius: 4px;
        font-weight: bold;
      `;
      messageDiv.textContent = message;

      const messagesContainer = document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.appendChild(messageDiv);
      } else {
        const form = document.getElementById("substance-form");
        if (form && form.parentNode) {
          form.parentNode.insertBefore(messageDiv, form.nextSibling);
        } else {
          const app = document.getElementById("app");
          if (app && app.firstChild) {
            app.insertBefore(messageDiv, app.firstChild);
          }
        }
      }

      // Remover el mensaje después de 3 segundos
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 3000);
    }

    // Función para mostrar mensajes de error
    function showErrorMessage(message) {
      const existingMessage = document.querySelector(".error-message");
      if (existingMessage) {
        existingMessage.remove();
      }

      const messageDiv = document.createElement("div");
      messageDiv.className = "error-message";
      messageDiv.style.cssText = `
        background-color: #f8d7da;
        color: #721c24;
        padding: 10px;
        margin: 10px 0;
        border: 1px solid #f5c6cb;
        border-radius: 4px;
        font-weight: bold;
      `;
      messageDiv.textContent = message;

      const messagesContainer = document.getElementById("messages-container");
      if (messagesContainer) {
        messagesContainer.appendChild(messageDiv);
      } else {
        const form = document.getElementById("substance-form");
        if (form && form.parentNode) {
          form.parentNode.insertBefore(messageDiv, form.nextSibling);
        } else {
          const app = document.getElementById("app");
          if (app && app.firstChild) {
            app.insertBefore(messageDiv, app.firstChild);
          }
        }
      }

      // Remover el mensaje después de 5 segundos
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 5000);
    }
  } else {
    // Funcionalidad para modo solo lectura
    const backButton = document.getElementById("back-to-event-details");
    if (backButton) {
      backButton.addEventListener("click", () => {
        import("../app.js").then(({ navigateTo }) => {
          navigateTo("/event-details", data);
        });
      });
    }

    const printButton = document.getElementById("print-report");
    if (printButton) {
      printButton.addEventListener("click", () => {
        window.print();
      });
    }
  }

  // Renderizar la lista inicial de sustancias
  updateSubstanceList(data.event.substances);
}
