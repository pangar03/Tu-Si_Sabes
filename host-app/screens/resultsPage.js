import { makeRequest, socket } from "../app.js"

export default async function renderResultsPage(data = {}){
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
        <ul id="substance-list"></ul>
    `;

    const substanceList = document.getElementById("substance-list");
    data.event.substances.forEach(async (substance) =>  {
        let substanceData;
        let adulterantData;
        const substanceResponse = await makeRequest(`/substances?id=${substance.primary_substance}`, "GET");
        substanceData = substanceResponse.substance ? substanceResponse.substance : null;
        const adulterantResponse = substance.adulterant_presence ? await makeRequest(`/adulterants?id=${substance.adulterant}`, "GET") : null;
        adulterantData = adulterantResponse ? adulterantResponse.adulterant : null;

        const substanceCard = document.createElement("li");
        substanceCard.classList.add("substance-card");
        if(substanceData) {
            substanceCard.innerHTML = `
                <div class="substance-card-header">
                    <h3>Sustancia llevada como ${substance.reported_substance}</h3>
                    <p>ID del análisis: ${substance.id}</p>
                    <p>Resultados preliminares: ${substance.primary_substance + (substance.adulterant_presence ? " + " + substance.adulterant : "")}</p>
                </div>
                <div class="substance-highlights"></div>
                <ul class="substance-risks">
                    <h4>Riesgos</h4>
                    ${substanceData?.riesgos.map(risk => `<li>${risk}</li>`).join("")}
                    ${adulterantData?.riesgos.map(risk => `<li>${risk}</li>`).join("")}
                </ul>
                <ul class="substance-recomendations">
                    <h4>Recomendaciones</h4>
                    ${substanceData?.recomendaciones.map(recomendation => `<li>${recomendation}</li>`).join("")}
                    ${adulterantData?.recomendaciones.map(recomendation => `<li>${recomendation}</li>`).join("")}
                </ul>
                <div class="substance-considerations">
                    <h4>Consideraciones</h4>
                    <p>${substance.considerations}</p>
                </div>
            `;
            const substanceHighlights = substanceCard.querySelector(".substance-highlights");
    
            if((substanceData.hasOwnProperty("es_peligroso") && substanceData.es_peligroso) || (adulterantData && adulterantData.es_peligroso)) {
                substanceHighlights.innerHTML = `<h4>Se recomienda evitar totalmente el consumo de esta sustancia</h4>`;
            }
        } else {
            substanceCard.innerHTML = `
                <div class="substance-card-header">
                    <h3>Sustancia llevada como ${substance.reported_substance}</h3>
                    <p>ID del análisis: ${substance.id}</p>
                    <p>Resultados preliminares: ${substance.primary_substance + (substance.adulterant_presence ? " + " + substance.adulterant : "")}</p>
                </div>
                <div class="substance-highlights"></div>
                <ul class="substance-risks">
                </ul>
                <ul class="substance-recomendations">
                </ul>
                <div class="substance-considerations">
                    <h4>Consideraciones</h4>
                    <p>${substance.considerations}</p>
                </div>
            `;

            const risksList = substanceCard.querySelector(".substance-risks");
            const recomendationsList = substanceCard.querySelector(".substance-recomendations");

            if(substanceData || adulterantData) {
                risksList.innerHTML = `
                    <h4>Riesgos</h4>
                `;
                recomendationsList.innerHTML = `
                    <h4>Recomendaciones</h4>
                `;

                if(substanceData) {
                    risksList.innerHTML += substanceData.riesgos.map(risk => `<li>${risk}</li>`).join("");
                    recomendationsList.innerHTML += substanceData.recomendaciones.map(recomendation => `<li>${recomendation}</li>`).join("");
                }
                if(adulterantData) {
                    risksList.innerHTML += adulterantData.riesgos.map(risk => `<li>${risk}</li>`).join("");
                    recomendationsList.innerHTML += adulterantData.recomendaciones.map(recomendation => `<li>${recomendation}</li>`).join("");
                }
            }
        }

        substanceList.appendChild(substanceCard);
    });
};