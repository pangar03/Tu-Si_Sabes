const path = require('path');
const fs = require('fs');

const adulterantPath = path.join(__dirname, "../../data/adulterants.data.json");
const adulterantData = JSON.parse(fs.readFileSync(adulterantPath, "utf-8"));

const substancePath = path.join(__dirname, "../../data/substances.data.json");
const substanceData = JSON.parse(fs.readFileSync(substancePath, "utf-8"));

function getAllAdulterants() {
    return {code: 200, message: "Adulterantes obtenidos exitosamente", adulterants: adulterantData};
};

function getAllSubstances() {
    return {code: 200, message: "Sustancias obtenidas exitosamente", substances: substanceData};
};

function getSubstanceById(id) {
    let substance = substanceData.find((substance) => substance.id === id);
    if (!substance) {
        substance = adulterantData.find((adulterant) => adulterant.id === id);
        if(!substance) {
            return { code: 404, message: "No se ha encontrado la sustancia ni el adulterante", substance: null };
        } else {
            return { code: 200, substance, message: "La sustancia se encontró exitosamente" };
        }
    } else {
        return { code: 200, substance, message: "La sustancia se encontró exitosamente" };
    }
};

function getAdulterantById(id) {
    const adulterant = adulterantData.find((adulterant) => adulterant.id === id);
    if (!adulterant) {
        return { code: 404, message: "No se ha encontrado el adulterante", adulterant: null };
    } else {
        return { code: 200, adulterant, message: "El adulterante se encontró exitosamente" };
    }
};

module.exports = {
    getAllAdulterants,
    getAllSubstances,
    getSubstanceById,
    getAdulterantById,
};