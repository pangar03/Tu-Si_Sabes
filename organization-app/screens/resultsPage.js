import { makeRequest } from "../app.js";
import { socket } from "../app.js";

export default async function renderResultsPage(data = {}){

    const substancesData = await makeRequest("/substances", "GET");
    const adulterantsData = await makeRequest("/adulterants", "GET");

    const substances = substancesData.substances;
    const adulterants = adulterantsData.adulterants;

    console.log("SUBSTANCES", substances);
    console.log("ADULTERANTS", adulterants);

    socket.on("add-substance", (res) => {
        renderResultsPage({...data, event: res.event});
    });
    
    const app = document.getElementById("app");
    app.innerHTML = `
        <div id="event-details-header">
            <h2>${data.event.eventName}</h2>
            <p>Inicio: ${data.event.eventStartDate}</p>    
            <p>Fin: ${data.event.eventEndDate}</p>    
            <p>${data.event.eventLocation}</p>
            <h4>ID del informe: ${data.event.id}</h4>
        </div>
        <div id="substance-register">
            <h3>Registro de sustancias</h3>
            <p>Recuerde que si la sustancia no aparece en la base de datos, recuerde seleccionar "Sustancia no registrada" e incluya las consideraciones adicionales</p>
            <form id="substance-form">
                <input type="text" id="reported-substance" placeholder="Sustancia reportada a analizar" required>
                <label for="primary-substance">Sustancia primaria</label>
                <select id="primary-substance" required>
                    <option value="">Seleccione una sustancia</option>
                    ${substances.map(substance => `<option value="${substance.id}">${substance.nombre_comun}</option>`).join("")}
                    ${adulterants.map(adulterant => `<option value="${adulterant.id}">${adulterant.nombre_comun}</option>`).join("")}
                    <option value="other">Sustancia no registrada</option>
                </select>
                <input type="text" id="primary-substance-other" placeholder="Ingrese el nombre de la sustancia hallada" style="display: none;"></input>
                <label for="adulterant-presence">¿Se ha encontrado algún adulterante?</label>
                <input type="checkbox" id="adulterant-presence" value="false"></input>
                <label for="adulterant">Adulterante presente</label>
                <select id="adulterant" disabled>
                    <option value="">Seleccione un adulterante</option>
                    ${adulterants.map(adulterant => `<option value="${adulterant.id}">${adulterant.nombre_comun}</option>`).join("")}
                </select>
                <textarea id="considerations" placeholder="Consideraciones adicionales"></textarea>
                <button type="submit" id="submit-substance">Registrar Sustancia</button>
            </form>
        </div>
        <ul id="substance-list"></ul>
    `;

    // Mostrar el input de "Sustancia no registrada" al seleccionar la opción
    const primarySubstanceSelect = document.getElementById("primary-substance");
    const primarySubstanceOtherInput = document.getElementById("primary-substance-other");
    primarySubstanceSelect.addEventListener("change", () => {
        if (primarySubstanceSelect.value === "other") {
            primarySubstanceOtherInput.style.display = "block";
            primarySubstanceOtherInput.required = true;
        } else {
            primarySubstanceOtherInput.style.display = "none";
            primarySubstanceOtherInput.required = false;
        }
    });

    // Habilitar/Deshabilitar el select de adulterantes al inicio
    const adulterantPresence = document.getElementById("adulterant-presence");
    const adulterantSelect = document.getElementById("adulterant");
    adulterantPresence.addEventListener("change", () => {
        if (adulterantPresence.checked) {
            adulterantSelect.disabled = false;
        } else {
            adulterantSelect.disabled = true;
        }
    });

    // Formulario de registro de sustancias
    const substanceForm = document.getElementById("substance-form");
    substanceForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const reportedSubstance = document.getElementById("reported-substance").value;
        let primarySubstance = document.getElementById("primary-substance").value;
        primarySubstance === "other" ? primarySubstance = document.getElementById("primary-substance-other").value : primarySubstance;
        const adulterantPresenceValue = document.getElementById("adulterant-presence").checked;
        const adulterant = document.getElementById("adulterant").value;
        const considerations = document.getElementById("considerations").value;

        const response = await makeRequest(`/event/${data.event.id}/substance`, "POST", {
            id: Date.now(),
            eventId: data.event.id,
            reported_substance: reportedSubstance,
            primary_substance: primarySubstance,
            adulterant_presence: adulterantPresenceValue,
            adulterant: adulterant,
            considerations: considerations
        });
    });

    // Renderizar la lista de las sustancias añadidas
    const substanceList = document.getElementById("substance-list");
    data.event.substances.forEach(substance => {
        const substanceItem = document.createElement("li");
        substanceItem.innerHTML = `
            <h4>Sustancia reportada como ${substance.reported_substance}</h4>
            <p>Sustancia primaria: ${substance.primary_substance}</p>
            <p>Adulterante: ${substance.adulterant || "No se encontró adulterantes en la sustancia"}</p>
            <p>Consideraciones sugeridas: ${substance.considerations || "No se sugirió ninguna consideración adicional"}</p>
        `;

        substanceList.appendChild(substanceItem);
    });
};

